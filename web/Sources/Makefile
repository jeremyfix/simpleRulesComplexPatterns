
OUTPUT_DIR=../Site
SOURCES=$(wildcard *.rst)
TARGETS=$(patsubst %.rst,$(OUTPUT_DIR)/%.html, $(SOURCES))
STYLE=main.css

build: ipe_png
	@rst2html.py --traceback  --no-toc-backlinks --language=en --generator --date  --math-output="MathJax https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-AMS_CHTML" --link-stylesheet --stylesheet=$(STYLE) --stylesheet-dirs=. index.rst $(OUTPUT_DIR)/index.html 
	@cp $(STYLE) $(OUTPUT_DIR)
	@cp -r fonts $(OUTPUT_DIR)
	#@cp -r data $(OUTPUT_DIR)
	@cp -r Figs $(OUTPUT_DIR)
	@echo "Generation done"

IPE_SOURCES=$(wildcard Figs/*.ipe)
IPE_PNG=$(patsubst %.ipe,%.png,$(IPE_SOURCES))
ipe_png:$(IPE_PNG)
	@echo "ipe to pdf conversion done"
Figs/%.png: Figs/%.ipe
	@iperender -png -resolution 150 $^ $@

clean:
	@rm -f *~
