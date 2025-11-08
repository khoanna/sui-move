#[test_only]
module hello_move::hello_move_tests;

const ENotImplemented: u64 = 0;

#[test]
fun test_hello_move() {
    // pass
}

#[test, expected_failure(abort_code = ::hello_move::hello_move_tests::ENotImplemented)]
fun test_hello_move_fail() {
    abort ENotImplemented
}

