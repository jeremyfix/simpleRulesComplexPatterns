#include "simplerules.hpp"

#include <memory>

using namespace std::placeholders;
#define WIDTH 200
#define HEIGHT 200

int main(int argc, char* argv[]) {
  
   std::random_device rd;
   std::mt19937 gen(rd());
   
  using Model = simplerules::reactiondiffusion::Ising<WIDTH, HEIGHT>;
  Model model(10.0);
  model.init(gen);
   
  ccmpl::Main m(argc,argv,"view-ising");
  
  auto display = ccmpl::layout(4.0, 4.0, {"#"});
  display.set_ratios({1.},{1.});
  
  display().title = "Ising";
  display() = {-1., 1., -1., 1.};
  display() = "equal";
  display() += ccmpl::image("cmap='binary', interpolation='nearest', clim=(0,1)", std::bind(&Model::fill_data, std::cref(model), _1, _2, _3, _4, _5));

  m.generate(display, true);

  int epoch = 0;
  while(true) {
    model.step(gen);

    std::cout << display("#", ccmpl::nofile(), ccmpl::nofile());

    ++epoch;

    std::cerr << epoch << std::endl;
    if(epoch == 100) {
      std::cerr << "changing temp to .." << std::endl;
      model.setTemperature(0.5);
    }
  }

  std::cout << ccmpl::stop;

  return 0;
}
