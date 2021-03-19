build: node_modules packages/**/*.js packages/**/*.ts packages/**/**/*.ts
	npm run dist

node_modules:
	npm install

clean: node_modules
	npm run clean

distclean: clean
	rm -rf node_modules
