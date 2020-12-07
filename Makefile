# Check lint of entire project or by extension
lint: lint-horusec-vscode

lint-horusec-vscode:
	cd ./horusec-vscode && npm run lint && cd ..

# ========================================================================================= #