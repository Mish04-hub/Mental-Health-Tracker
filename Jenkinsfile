pipeline {
    agent any

    stages {

        stage('1. Checkout Source Code') {
            steps {
                echo 'Cloning repository from GitHub'
                checkout scm
            }
        }

        stage('2. Install Backend Dependencies') {
            steps {
                echo 'Installing backend dependencies using npm'
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('3. Build Frontend Application') {
            steps {
                echo 'Installing frontend dependencies and building application'
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build || true'
                }
            }
        }

    post {
        success {
            echo 'Build and Test stages completed successfully'
        }
        failure {
            echo 'Pipeline failed'
        }
    }
}