cmake_minimum_required( VERSION 2.8 )

set(CMAKE_BUILD_TYPE Release)

#set(CMAKE_CXX_STANDARD 17)
#set(CMAKE_CXX_STANDARD_REQUIRED ON)


find_package(PkgConfig)

pkg_check_modules(CCMPL ccmpl REQUIRED)


add_subdirectory(experiments)
  
