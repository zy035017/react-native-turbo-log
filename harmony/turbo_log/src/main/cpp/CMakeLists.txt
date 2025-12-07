cmake_minimum_required(VERSION 3.13)
set(CMAKE_VERBOSE_MAKEFILE on)

set(turbo_log_generated_dir "${CMAKE_CURRENT_SOURCE_DIR}/generated")
file(GLOB_RECURSE turbo_log_generated_SRC "${turbo_log_generated_dir}/**/*.cpp")
file(GLOB turbo_log_SRC CONFIGURE_DEPENDS *.cpp)
add_library(turbo_log SHARED ${turbo_log_SRC} ${turbo_log_generated_SRC})
target_include_directories(turbo_log PUBLIC ${CMAKE_CURRENT_SOURCE_DIR} ${turbo_log_generated_dir})
target_link_libraries(turbo_log PUBLIC rnoh)