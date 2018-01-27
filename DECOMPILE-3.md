Scenario 3
----------

0x00:

66
c3 a6 b8
c3 d1 be
c3 53 c1
c3 eb c1
c3 88 ff
c3 09 cc
c3 bb cb
c3 d7 cb
66 00 00


0x0d6d: String mapping starts
0x0f29: Strings start
0x11f6: Tagged sequences (94x excluding top and tail):

00: 81
01: 85 02 0d 05 04
02: 85 01 0d 06 04
03: 85 04 05 1f 0a
04: 87 03 05 05 07 15 06
05: 89 01 04 04 07 06 0d 0c 03
06: 87 02 04 05 0d 0e 03
07: 83 0f 03
08: 83 11 03
09: 85 0a 0b 12 05
0a: 87 09 0b 0b 0a 14 05
0b: 85 0a 0a 30 11
87 05 03 0d 06 16 03
87 0c 06 0e 07 22 07
89 06 03 0d 07 0f 06 17 05
87 07 03 0e 06 10 06
87 0f 06 11 08 18 05
87 08 03 10 08 12 07
89 09 05 11 07 13 05 1a 05
87 12 05 14 06 1b 05
87 0a 05 13 06 1c 05
87 04 06 16 07 20 04
87 0c 03 15 07 21 04
87 0e 05 18 0c 23 02
87 10 05 17 0c 19 0a
87 18 0a 1a 05 3a 10
87 12 05 19 05 1b 05
89 13 05 1a 05 1c 06 2c 08
89 14 05 1b 06 1d 04 2e 07
83 1c 04
85 1f 02 24 06
87 03 0a 1e 02 20 05
87 15 04 1f 05 21 06
89 16 04 20 06 22 07 26 06
89 0d 07 21 07 23 07 28 06
87 17 02 22 07 2a 06
87 1e 06 25 09 3e 08
87 24 09 26 04 36 08
87 21 06 25 04 27 04
87 26 04 28 03 31 05
87 22 06 27 03 29 02
87 28 02 2a 05 32 05
87 23 06 29 05 33 05
83 2c 03
89 1b 08 2b 03 2d 06 3c 08
87 2c 06 2e 01 3d 08
87 1c 07 2d 01 2f 05
87 2e 05 30 05 34 03
85 0b 11 2f 05
87 27 05 32 05 37 03
87 29 05 31 05 33 07
89 2a 05 32 07 38 09 40 07
83 2f 03
87 36 05 3e 04 47 07
87 25 08 35 05 37 08
87 31 03 36 08 49 07
87 33 09 39 08 41 04
87 38 08 3a 04 42 04
87 19 10 39 04 3b 03
87 3a 03 3c 07 43 04
89 2c 08 3b 07 3d 06 44 04
87 2d 08 3c 06 45 04
87 24 08 35 04 46 07
83 40 04
89 33 07 3f 04 41 08 4f 08
89 38 04 40 08 42 08 4b 05
87 39 04 41 08 43 07
89 3b 04 42 07 44 07 4d 05
89 3c 04 43 07 45 06 4e 05
87 3d 04 44 06 5d 0d
85 3e 07 47 04
89 35 07 46 04 48 08 56 09
87 47 08 49 05 4a 03
85 37 07 48 05
83 48 03
87 41 05 4c 0a 50 03
87 4b 0a 4d 05 51 03
87 43 05 4c 05 4e 07
87 44 05 4d 07 5c 08
87 40 08 50 08 58 04
87 4b 03 4f 08 59 05
87 4c 03 53 05 54 05
83 57 03
85 51 05 5a 03
85 51 05 5b 03
83 5e 04
85 47 09 57 13
87 52 03 56 13 58 06
85 4f 04 57 06
85 50 05 5a 05
87 53 03 59 05 5b 0a
87 54 03 5a 0a 5c 07
87 4e 08 5b 07 5d 06
87 45 0d 5c 06 5e 05
85 55 04 5d 05
80

Value 1: contiguous

Value 2: quite varied, non-contiguous

   2 01
   6 02
  32 03
  36 04
  60 05
  32 06
  36 07
  28 08
   6 09
  10 0a
   2 0b
   2 0c
   6 0d
   2 10
   2 11
   2 13

0x0e, 0x0f, 0x12 are missing. All values appear an even number of times. 01
appears in 2e 01 and 2d 01; 0b appears in 0a 0b and 09 0b; 13 appears in 57 13
and 56 13. 10 appears in 3a 10 and 19 10. 11 appears in 30 11 and 0b 11. 0c
appears in 17 0c and 18 0c. It's possible that all of these pairs refer to the
same things. The 3a-19 and 30-0b linkage suggests a dimensionality, although
with the deltas involved (33 and 37) it's not clear what exactly that is.

With 94 of these, if they're blocks they would have to be about 8 x 5. This
scenario is fairly complicated in terms of routing.

Speculation: the left and right side may refer to the same thing. If so, 0a 0a
is redundant and 09 0b 0b 0a inefficient, but this would certainly explain the gaps.