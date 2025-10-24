NPM_BIN := npm
NPX_BIN := npx
INSTALL_DIR := install

dev: \
	$(INSTALL_DIR)/.dir.stamp \
	$(INSTALL_DIR)/.asdf.stamp \
	$(INSTALL_DIR)/.npm.stamp

$(INSTALL_DIR)/.dir.stamp:
	@mkdir -p $(INSTALL_DIR)
	@touch $@

$(INSTALL_DIR)/.asdf.stamp:
	@asdf install
	@touch $@

$(INSTALL_DIR)/.npm.stamp: $(PACKAGE_LOCK) $(INSTALL_DIR)/.asdf.stamp
	@$(NPM_BIN) install
	@touch $@

dev/run:
	@$(NPM_BIN) run dev

fmt:
	@$(NPX_BIN) prettier --write .

build:
	@$(NPM_BIN) run build

serve: build
	@$(NPM_BIN) run preview
