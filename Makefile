GO ?= go
ADDLICENSE ?= addlicense
HORUSEC ?= horusec

# Check lint of entire project or by extension
lint: lint-horusec-vscode


lint-horusec-vscode:
	npm run lint

install-horusec-vscode:
	npm install

compile-horusec-vscode:
	npm run compile

build-horusec-vscode:
	npm run package

license:
	$(GO) get -u github.com/google/addlicense
	@$(ADDLICENSE) -check -f ./copyright.txt $(shell find -regex '.*\.\(go\|js\|ts\|yml\|yaml\|sh\|dockerfile\)')

license-fix:
	$(GO) get -u github.com/google/addlicense
	@$(ADDLICENSE) -f ./copyright.txt $(shell find -regex '.*\.\(go\|js\|ts\|yml\|yaml\|sh\|dockerfile\)')

security:
    ifeq (, $(shell which $(HORUSEC)))
		    curl -fsSL https://raw.githubusercontent.com/ZupIT/horusec/master/deployments/scripts/install.sh | bash -s latest
		    $(HORUSEC) start -p="./" -e="true"
    else
		    $(HORUSEC) start -p="./" -e="true"
    endif

pipeline: install-horusec-vscode lint-horusec-vscode compile-horusec-vscode build-horusec-vscode security
