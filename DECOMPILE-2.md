Scenario 2
----------

Mostly for comparison with scenario 1!

0x1195: Tagged values (86x excluding top and bottom):

81
85 02 06 38 0d
87 01 06 03 04 04 05
83 02 04
87 02 05 06 03 08 02
83 06 02
87 04 03 05 02 07 02
83 06 02
89 04 02 09 04 0b 02 0c 04
85 08 04 0a 02
83 09 02
83 08 02
85 08 04 0d 06
85 0c 06 0e 03
87 0d 03 0f 06 10 03
83 0e 06
85 0e 03 11 06
85 10 06 56 01
87 56 02 13 05 14 04
83 12 05
87 12 04 15 0c 21 09
85 14 0c 16 03
87 15 03 17 05 1a 05
87 16 05 19 03 1a 04
83 19 02
85 17 03 18 02
87 17 04 16 05 1b 07
89 1a 07 1c 09 27 04 2c 06
85 1b 09 1d 03
87 1c 03 1e 01 25 04
85 1d 01 1f 03
85 1e 03 20 04
89 1f 04 21 06 23 07 24 0b
87 14 09 20 06 22 02
83 21 02
83 20 07
87 20 0b 4c 11 50 09
85 1d 04 26 09
89 25 09 27 04 29 06 4d 05
87 1b 04 26 04 28 02
83 27 02
87 26 06 2a 03 39 04
87 29 03 2b 02 2c 04
83 2a 02
87 1b 06 2a 04 2d 01
85 2c 01 2e 07
87 2d 07 2f 01 30 03
83 2e 01
87 2e 03 31 01 32 01
83 30 01
87 30 01 33 02 34 02
83 32 02
87 32 02 35 01 36 02
83 34 01
87 34 02 37 03 38 02
83 36 03
85 01 0d 36 02
85 29 04 3a 04
85 39 04 3b 02
85 3a 02 3c 22
85 3b 22 3d 07
85 3c 07 55 06
87 54 05 3f 02 40 02
83 3e 02
85 3e 02 41 02
87 40 02 43 04 44 05
83 43 03
89 41 04 42 03 44 04 48 04
89 41 05 43 04 45 02 46 03
83 44 02
85 44 03 47 01
83 46 01
85 43 04 49 04
87 48 04 4a 03 4c 06
87 49 03 4b 02 4c 05
83 4a 02
8b 24 11 49 06 4a 05 4d 02 4e 02
87 26 05 4c 02 4e 02
85 4c 02 4d 02
83 50 06
87 24 09 4f 06 53 06
85 53 03 52 0e
83 51 0e
85 50 06 51 03
85 3e 05 55 01
85 54 01 3d 06
85 11 01 12 02
80

Value 1: 01-56 (1-86!), contiguous. Roughly even distribution, except 4c appears
5 times.

Value 2: ~20-30x 1-6 (46x 02!). Values 08, 0a, 0f, 10, 12-21 missing. Max is
0x22. All appear an even number of times. 0x22 is definitely "special", and 0x11
probably is too.

With the first two values being mutually referential it's unlikely that this is
intended to be a finite sequence expansion. If it were route hints, these might
be conditional pairs, ie "if 0x54: 0x01".

z80 code block ends:

cd  d7 71 21 be d6 23 7e fe  |.*a..b...q!..#~.|
00000c32  4b 20 02 36 14 01 5e e6  a7 ed 42 c8 09 18 ee 56  |K .6..^...B....V|
00000c42  0d 01 01 03 05 08 0c 12  0c 08 06 05 03 01 01 02  |................|
00000c52  01 01 02 00 00 02 04 05  02 00 00 00 00 00 00 01  |................|
00000c62  00 00 00 00 0e 06 00 00  00 00 00 00 00 00 01 2b  |...............+|
00000c72  28 1d 00 00 00 00 00 00  01 4c 24 14 1a 00 00 00  |(........L$.....|
00000c82  00 00 01 52 13 00 00 00  00 00 00 00 01 3c 3b 20  |...R.........<; |
00000c92  11 01 49 00 00 00 01 01  27 3c 24 11 00 00 00 00  |..I.....'<$.....|

call 0x71d7
ld hl, 0xd6be
|-18 position| inc hl
ld a, [hl]
cp 0x4b
jr nz, 02
ld [hl], 0x14
ld bc, 0xe65e
and a
sbc hl, bc
ret z
add hl, bc
jr [~0xee -> -18]

That puts the end point at 0x0c40.