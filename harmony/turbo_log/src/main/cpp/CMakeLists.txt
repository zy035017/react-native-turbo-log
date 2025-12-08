cmake_minimum_required(VERSION 3.13)
set(CMAKE_VERBOSE_MAKEFILE on)

set(rnoh_turbo_log_generated_dir "${CMAKE_CURRENT_SOURCE_DIR}/generated")
file(GLOB_RECURSE rnoh_turbo_log_generated_SRC "${rnoh_turbo_log_generated_dir}/**/*.cpp")
file(GLOB rnoh_turbo_log_SRC CONFIGURE_DEPENDS *.cpp)
add_library(rnoh_turbo_log SHARED ${rnoh_turbo_log_SRC} ${rnoh_turbo_log_generated_SRC})
target_include_directories(rnoh_turbo_log PUBLIC ${CMAKE_CURRENT_SOURCE_DIR} ${rnoh_turbo_log_generated_dir})
target_link_libraries(rnoh_turbo_log PUBLIC rnoh)