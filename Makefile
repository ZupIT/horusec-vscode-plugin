GO ?= go
ADDLICENSE ?= addlicense

# Check lint of entire project or by extension
lint: lint-horusec-vscode


lint-horusec-vscode:
	npm run lint

install-horusec-vscode:
	npm install

license:
	$(GO) get -u github.com/google/addlicense
	@$(ADDLICENSE) -check -f ./copyright.txt $(shell find -regex '.*\.\(go\|js\|ts\|yml\|yaml\|sh\|dockerfile\)')

license-fix:
	$(GO) get -u github.com/google/addlicense
	@$(ADDLICENSE) -f ./copyright.txt $(shell find -regex '.*\.\(go\|js\|ts\|yml\|yaml\|sh\|dockerfile\)')
