pipeline {
    agent {label 'Nodo_105.95'}
    stages {
        stage('Deployando Proyecto') {
            steps {
                sh 'sh .github/update_war.sh'
            }
        }
    }
}