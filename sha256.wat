(module
    (func $Ch (param $x i32) (param $y i32) (param $z i32) (result i32)
        (i32.xor
            (i32.and
                (local.get $x)
                (local.get $y))
            (i32.and
                (i32.xor
                    (local.get $x)
                    (i32.const -1))
                (local.get $z))))

    (func $Maj (param $x i32) (param $y i32) (param $z i32) (result i32)
        (i32.and
            (local.get $x)
            (local.get $y))
        (i32.xor
            (i32.and
                (local.get $x)
                (local.get $z)))
        (i32.xor
            (i32.and
                (local.get $y)
                (local.get $z))))

    (func $E2560 (param $x i32) (result i32)
        (i32.rotr (local.get $x) (i32.const 2))
        (i32.xor (i32.rotr (local.get $x) (i32.const 13)))
        (i32.xor (i32.rotr (local.get $x) (i32.const 22))))

    (func $E2561 (param $x i32) (result i32)
        (i32.rotr (local.get $x) (i32.const 6))
        (i32.xor (i32.rotr (local.get $x) (i32.const 11)))
        (i32.xor (i32.rotr (local.get $x) (i32.const 25))))

    (func $o2560 (param $x i32) (result i32)
        (i32.rotr (local.get $x) (i32.const 7))
        (i32.xor (i32.rotr (local.get $x) (i32.const 18)))
        (i32.shr_u (local.get $x) (i32.const 3)))

    (func $o2561 (param $x i32) (result i32)
        (i32.rotr (local.get $x) (i32.const 17))
        (i32.xor (i32.rotr (local.get $x) (i32.const 19)))
        (i32.shr_u (local.get $x) (i32.const 10)))
    
)