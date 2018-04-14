
file(GLOB 
  ccfiles
  *.cpp
  )

include_directories(${CMAKE_SOURCE_DIR}/src)

foreach(f ${ccfiles})
    get_filename_component(exampleName ${f} NAME_WE) 
    add_executable (${exampleName} ${f}) 
    target_link_libraries(${exampleName} ${CCMPL_LIBRARIES})
    target_include_directories(${exampleName} PUBLIC ${CCMPL_INCLUDE_DIRS})
    target_compile_options(${exampleName} PUBLIC ${CCMPL_CFLAGS_OTHER})
endforeach(f)
