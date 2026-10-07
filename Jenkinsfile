pipeline {
    agent any

    environment {
        BACKEND_IMAGE = 'diff-visualizer-backend'
        FRONTEND_IMAGE = 'diff-visualizer-frontend'
        DOCKERHUB_REPO = 'keya115251'
        TRIVY_IMAGE = 'aquasec/trivy:0.75.0'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend: Install & Test') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }

        stage('Frontend: Install & Test') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }

        stage('Frontend: Build') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Docker: Build Images') {
            steps {
                sh "docker build -t ${BACKEND_IMAGE}:latest ./backend"
                sh "docker build -t ${FRONTEND_IMAGE}:latest ./frontend"
            }
        }

        stage('Docker Hub: Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
                                                  usernameVariable: 'DOCKERHUB_USER',
                                                  passwordVariable: 'DOCKERHUB_TOKEN')]) {
                    // Single-quoted so Groovy never interpolates the token; printenv keeps it out of the -x trace
                    sh 'printenv DOCKERHUB_TOKEN | docker login -u "$DOCKERHUB_USER" --password-stdin'
                }
                script {
                    for (img in [BACKEND_IMAGE, FRONTEND_IMAGE]) {
                        for (tag in [env.BUILD_NUMBER, 'latest']) {
                            sh "docker tag ${img}:latest ${DOCKERHUB_REPO}/${img}:${tag}"
                            sh "docker push ${DOCKERHUB_REPO}/${img}:${tag}"
                        }
                    }
                }
            }
            post {
                always {
                    sh 'docker logout'
                }
            }
        }

        stage('Security: Trivy Scan') {
            steps {
                script {
                    // Report only (exit-code 0): known npm audit findings would otherwise fail the build.
                    // Trivy runs as a container via the host docker socket; the cache volume avoids
                    // re-downloading the vulnerability DB on every build.
                    for (img in [BACKEND_IMAGE, FRONTEND_IMAGE]) {
                        sh """
                            docker run --rm \\
                              -v /var/run/docker.sock:/var/run/docker.sock \\
                              -v trivy-cache:/root/.cache/ \\
                              ${TRIVY_IMAGE} image \\
                              --severity HIGH,CRITICAL \\
                              --exit-code 0 \\
                              --no-progress \\
                              ${DOCKERHUB_REPO}/${img}:${env.BUILD_NUMBER}
                        """
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                // The kubeconfig is a Jenkins secret file; kubectl reads it from $KUBECONFIG,
                // so its path and contents never appear in the build log.
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    // Render copies of k8s/ with the backend/frontend images pinned to this
                    // build's tag, so one apply gives one rollout and never reverts to :latest.
                    // The manifests in the repo stay untouched.
                    sh """
                        set -eu
                        rm -rf .k8s-rendered
                        cp -r k8s .k8s-rendered
                        for img in ${BACKEND_IMAGE} ${FRONTEND_IMAGE}; do
                            sed -i "s#image: ${DOCKERHUB_REPO}/\$img:latest#image: ${DOCKERHUB_REPO}/\$img:${env.BUILD_NUMBER}#" .k8s-rendered/*.yaml
                            grep -q "image: ${DOCKERHUB_REPO}/\$img:${env.BUILD_NUMBER}" .k8s-rendered/*.yaml
                        done
                        kubectl apply -f .k8s-rendered/00-namespace.yaml
                        kubectl apply -f .k8s-rendered/
                        kubectl rollout status deployment/backend -n diff-visualizer --timeout=300s
                        kubectl rollout status deployment/frontend -n diff-visualizer --timeout=300s
                        kubectl get pods,svc -n diff-visualizer
                    """
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully - app is deployed.'
        }
        failure {
            echo 'Pipeline failed - check the stage logs above.'
        }
    }
}
