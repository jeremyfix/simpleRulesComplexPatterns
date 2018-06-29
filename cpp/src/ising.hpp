
#include <tuple>
#include <random>
#include <ccmpl.hpp>

namespace simplerules {

  namespace reactiondiffusion {
    template<int WIDTH, int HEIGHT>
    class Ising {

      double _temperature;
      std::array<std::array<bool, WIDTH>, HEIGHT> _state;
      
    public:
      Ising(double t): _temperature(t) {
      }

      std::pair<int, int> getShape() const {
	return {WIDTH, HEIGHT};
      }
      
      void setTemperature(double t) {
	_temperature = t;
      }

      double getTemperature() const {
	return _temperature;
      }

      template<typename RD>
      void init(RD& gen) {
	std::uniform_real_distribution<> distrib;
	for(auto& si: _state) {
	  for(auto& sij: si)
	    sij = (bool)(distrib(gen) > 0.5);
	}	
      }

      double get_spin(unsigned int i, unsigned int j) const {
	return 2.0 * (_state[i][j]-0.5);
      }
      
      double sum_neighbors(unsigned int i, unsigned int j) {
	// We sum  North + EAST + SOUTH + WEST
	if(i == 0) {
	  if (j == 0) // Corner TL
	    return get_spin(HEIGHT-1, j) + get_spin(i,j+1) + get_spin(i+1,j) + get_spin(i,WIDTH-1);
	  else if(j == WIDTH-1) // Corner TR
	    return get_spin(HEIGHT-1,j) + get_spin(i,0) + get_spin(i+1,j) + get_spin(i,j-1);
	  else // top row
	    return get_spin(HEIGHT-1, j) + get_spin(i,j+1) + get_spin(i+1,j) + get_spin(i,j-1);
	}
	else if(i == HEIGHT - 1) {
	  if (j == 0) // Corner BL
	    return get_spin(i-1,j) + get_spin(i,j+1) + get_spin(0,j) + get_spin(i,WIDTH-1);
	  else if(j == WIDTH-1) // Corner BR
	    return get_spin(i-1,j) + get_spin(i,0) + get_spin(0,j) + get_spin(i,j-1);
	  else // Bottom row
	    return get_spin(i-1,j) + get_spin(i,j+1) + get_spin(0,j) + get_spin(i,j-1);
	}
	else {
	  if (j == 0) // Left border
	    return get_spin(i-1,j) + get_spin(i,j+1) + get_spin(i+1,j) + get_spin(i,WIDTH-1);
	  else if(j == WIDTH-1) // Right border
	    return get_spin(i-1,j) + get_spin(i,0) + get_spin(i+1,j) + get_spin(i,j-1);
	  else
	    return get_spin(i-1,j) + get_spin(i,j+1) + get_spin(i+1,j) + get_spin(i,j-1);
	}
      }

      
      template<typename RD>
      void step(RD& gen) {
	unsigned int i = 0;
	unsigned int j = 0;
	double dE = 0.0;
	double pflip = 0.0;
	std::uniform_real_distribution<> distrib;
	for(auto& si: _state) {
	  j = 0;
	  for(auto& sij: si) {
	    // We compute the variation of the energy
	    // caused by flipping this unit
	    if(distrib(gen) > 0.5) {
	    dE = 2.0 * get_spin(i, j) * sum_neighbors(i, j);
	    if(dE < 0.0) // unconditionnaly flip the spin
	      sij = !sij;
	    else {
	      pflip = exp(-_temperature * dE);
	      if(distrib(gen) < pflip)
	      	sij = !sij;
	    }
	    }
	    ++j;
	  }
	  ++i;
	}
      }

      void fill_data(std::vector<double>& x, std::vector<double>& y, std::vector<double>& z, unsigned int& width, unsigned int& depth) const {
	x.clear();
	y.clear();
	z.clear();

	width = WIDTH;
	depth = 1;

	auto outx = std::back_inserter(x);
	auto outy = std::back_inserter(y);
	auto outz = std::back_inserter(z);
	
	unsigned int i = 0;
	unsigned int j = 0;
	for(const auto& si: _state) {
	  j = 0;
	  *(outy++) = i;
	  for(const auto& sij: si) {

	    *(outz++) = sij;
	    if(i == 0) *(outx++) = j;
	    ++j;
	  }
	  ++i;
	}
	
      }

      
    };
    
  }
  
}
