pipeline {
	agent none
    stages {
		stage('Deploy on general') {
			agent {label 'Nodo_105.120'}
			steps {
                sh 'sh .github/script/update_node_105.120.sh'
                  }
		        }
		stage('Deploy on app'){
			agent {label 'Nodo_105.95'}
			steps {
                sh 'sh .github/script/update_node_105.95.sh'
                  }
		        }
	       }
}