Scenario 6
----------

51? bespoke sprites, which should take a total of 1632B (roughly 0x800)

Candidates for tile count (160) near: 0x290, 0x2c0, 0x8f0, 0x9d0, 0xcb0

Candidates for sprite count (176) near: 0x170, 0x280, 0x680

Candidate for string hunk length (0x182) near 0x2000, although this looks like part of a mini-map.

TZX header: 0x0-0x2c, payload length of 0x49e1

[0x00]-[0x43]: Probably basic header data. Some evidence of larger number formats (eg. 16-bit), although repetition gives some suggestion of 8-bit.

64
c3 9d b8
c3 d3 be
c3 5a c1
c3 f2 c1
c3 2b c2
c3 89 c2
c9 00 00
c9 00 00
64 00 00
...

The middle byte varies a lot, so it may be something like length, although length *itself* is improbable as it's too small for a number like 0xc289 but too big for a number like 0x89.

[0x003e]: Three 3-byte values: 32 00 01, 33 01 1e, ff ff ff
[0x0047]-?: 30-byte wide data, possibly just 2x. Alignment/start position not completely clear.

ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff fe f0 ff ff fd c0 f9 ff ff 80 07
0e 17 0a 19 0c 08 15 04 08 05 02 06 01 0a 03 01 05 ff ff 19 ff ff ff ff ff ff ff ff ff ff
0e 17 0a 19 0c 08 15 ff ff 05 02 06 01 0a 03 01 05 ff ff ff ff ff ff ff ff ff ff ff ff ff
-
[0x0113]-[0x0d17] (0x0c00): Undistinguished data. Some commonality present with "[", which may mean these are bounded numbers.

0x0d45-0x0e7d (0x0100): Possible map or sprite data. Ends ~0xe7d. Best guess 25B wide.

Some evidence of 10-byte sequences. Although these could be animation frames, a fair guess is that these are actually object properties.

```
0e 05 00 00 00 00 00 00 00 00

01 0a 24 0c 32 39 00 00 0e 01
01 01 07 0b 07 00 00 00 00 01
01 1d 23 13 11 00 00 00 00 01
01 0b 11 12 00 00 00 00 00 01
01 38 39 00 00 00 00 00 00 01
01 13 32 1d 0a 00 00 00 00 01
01 22 23 27 26 00 00 00 00 01
01 0a 0c 24 00 00 00 00 00 01
01 30 17 21 2d 29 00 00 00 00
01 29 2d 21 17 30 00 00 00 00
01 04 17 21 1b 03 00 00 00 00
01 03 1b 21 17 04 00 00 00 00

00 01 01 01 03 01 01 03 02 02
```

Alignment is difficult to pin down. The repeated values often have symmetry, which implies graphical data. Bits 6 & 7 (+64 and +128) are avoided, implying a practical width of 6px so these could be 12x10 sprites in the TL+TR+BL+BR format. Could be a text rendering? Or XOR patterns.

0xe7e-0xec5:

```
----2--3--4--5--6--7---|
a3 a4 a5 a6 a7 a8 a9 aa
9b 9c 9d 9e 9f a0 a1 a2
a3 a4
      96 97 98 99 9a
                     aa
8e 8f 90 91 92 93 94 95
7e 7f 80 81 82 83 84 85
76 77 78 79 7a 7b 7c 7d
7e
   67 68 69 6a 6b 6c 6d
6e 6f 70 71 72 73 74 75
5b 5c 5d 5e 5f 60 61 62
```

These appear to be rotation animation maps (8 bytes each). A few of the frames
are shared. It's in side order, although how the frame set is selected is unclear. There are 11 in total, so 5 for each side then 1 for the combat droids.

0xec6-0xed1: Death animations

```
47
   8a 8b 8c
44
   63 64 65
45
   57 58 59
```

This is a side colour followed by three frames on the way to a "destroyed" state.

0x0ed2-0x1054 [0xea5] (0x0182): Map tile string offsets
-
0x1055-0x127b [0x1028] (0x0226): Strings for map tile info

0x127c-0x1549 (0x0300): Undistinguished data. Sprites?

0x154a-0x179b (0x0200): Sprite or map data. Width 12B. 48 rows. Looks like animation frames

0x182c-0x1eea (0x0600): Sprite or map data. Width not clear.

[0x124f]-[0x139b]: Length-tagged values (59x)

02 19 09 05
01 19 07 04
05 14 08 04
05 0e 0d 07
03 14 04 0e 0e 07
07 05 0b 04
02 04 06 05
03 04 09 06 0f 05
01 05 08 06
10 06
06 04 0c 07 11 05 12 04
0b 07
04 07 17 0a
05 07 18 09
08 05 14 03
0a 06 11 06 16 03
0b 05 10 06 12 04 1d 09
0b 04 11 04 13 04
12 04 23 0d
0f 03 15 05
14 05 1b 06
10 03 1c 06
0d 0a 18 0b 2f 0e
0e 09 17 0b 19 04
18 04 20 06
1b 08 21 05
15 06 1a 08 1c 09
16 06 1b 09 2d 0d
11 09 1e 04 1f 03
1d 04 22 05
1d 03 24 05
19 06 21 09
1a 05 20 09
1e 05 23 04 26 05
13 0d 22 04 26 05 27 05
1f 05 25 02
24 02 2e 03
22 05 23 05 27 05 38 0c
23 05 26 05 32 05
29 06 2f 0d
28 06 2a 07 36 09
29 07 2b 09
2a 09 2c 04
2b 04 2d 05 3b 0a
1c 0d 2c 05 2e 06
25 03 2d 06
17 0e 28 0d 35 07
31 06
30 06 35 05
27 05
34 04 37 04
33 04 3a 05
2f 07 31 05
29 09 37 05
33 04 36 05
26 0c 39 06
38 06
34 05 3b 0b
2c 0a 3a 0b

Value 1 is a contiguous self-reference; value 2 is:

   2 02
   8 03
  24 04
  34 05
  20 06
  10 07
   2 08
  12 09
   4 0a
   4 0b
   2 0c
   6 0d
   4 0e
   2 14
   2 19

That's a range of 25 (26 with 0) with 15 distinct values.

[0x139c]-[0x140e]: 5-byte values. Or sometimes 10-byte.

06: Cycling value (00, 10, 1c initially)
15: Cycling value (10, 1c, 32 initially)
2d: Sometimes-increasing value.
33: Usually-increasing value. This may be a map to a similarly-ordered set.
07: Normally-incrementing value. It's possible that this is a next-step hint of some kind

[0x140f]-[0x151e]: Number pairs? one byte in undeterministic order followed by another in strong order which breaks down past 2c. Difficult to reliably tell where it ends. First number 01-6d, ff; second number 02-5e, 69-72, 7b. Fair chance the second number is a colour; the first is probably not a sprite or a tile ref.

[0x151f]-[0x1776]: 12-byte values. Generally-blank right side suggests "sprite" not "map"

[0x1777]-[0x1956]: 20-byte values. Bounded quite low, quite a lot of repetition. Looks a lot like a map, but I don't see that it could be. 24x, so if this refers to 8x8 sprites it could be a 160x192px display. In principle this COULD refer to 12x8 sprites, but that's improbable due to the way the display is addressed. If it is some kind of map/image, then the top is very crowded and the bottom largely void.

[0x195b]-[0x1a04]: 6-byte values. Bottom 3 always empty. Fairly small deltas so possibly animation frames. If so, they are probably 16x3, although 8x6 is also possible.

[0x1a05]-[0x1cde]: Null data, possibly just padding
-
[0x1cdf]-[0x1d7e]: Map entity/sprite properties. There's a good chance that this is multiple data concatenated. "Floor" etc: 0x00, "Water": 0x70, "Rock"/"Pipes"/"Airvent"/"Wall"/"Cupboard": 0x7f. One of the pipes: 0x27, sewage unit: 0x77; "Control console"/"Security door"/"Fuel drum"/"Gas canister": 0x73; one side: 0x08; the other: 0x12. This may express whether something is passable but not if it is destructible. 0x73 may express "operable" in some sense.
-
[0x1d7f]-[0x209e]: 40-byte repeating sequences, 20 of them. Appears to be the unit list.

02: (00, 01, 02) Side number?
0a: (0f, 0a, (16, 1a, 1c)) Varies a lot for side 0. Fairly likely to be a bit map, ie. 001111, 001010, 010110, 011010, 011100
06: Type? combat droid = 06, human = 05
82: Dead unit sprite
01: Unclear, sides 1 & 2 == 01, side 0 == 00. Could be actual alignment.
2f: (35-42, 2f) Varies except for side 2
2d: Varies except for side 2. Often but not always identical to previous.
28: Varies except for side 2
28: Varies except for side 2. Identical to previous. HP? Moves?
f0: Varies except for side 2.

f0: Varies except for side 2. Identical to previous.
fa: Varies except for side 2
fa: Varies except for side 2. Identical to previous.
14: 00 for side 0
10: 00 for side 0; Linked to previous
0c: 00 for side 0; Linked to previous
10: 00; linked
02: 00; linked
00: Varies (non-zero) except for side 2
22: Varies except for side 2

50: Varies
1e: Varies
01: Same except side 0 == 22
1c: Increasing number, except side 0 == 00. For side 1 this increases by 3 each time, for side 2 by 1. Probably something like turn order.
07: Combat droid = 7, human = 5
07: Varies for side 1
0b: Simple counter except for side 0 (== 0). Could be turn order?
36: Varies except side 2
00: Always 0
00: Always 0 except 2x 2e for side 2

03: As side number
20: Like side number?
02: As side number
04: Always 4
00: Always 0
83: Weapon entity
ff: Possibly linked to previous
1f: As side number
5a: Varies for side 1
00: Varies for side 0

Since side 0 is the human-only side, it is likely to be unequipped and without a starting point; it may also have some properties which apply only to human play, but that's relatively unlikely.

---

0x20cc-0x306b [0x209f] (0x1000): Map data. 80B wide, 50 lines. 4000B in total.
-
0x306c-0x32eb (0x0200): Map tile sprite offsets (apparently a colour pair) followed by a sprite offset, for each of the 160 possible tiles; then alternate versions of each tile, for the map view.
-
0x32ec-0x48ec [0x32bf] (0x1600): Quarter-sprites (8x8) put together. TL-TR-BL-BR. 176 sprites. 32 bytes each.
-
0x48ed-0x4964 [0x48c0] (0x5b): ???
-
0x4965-0x4a0d (0x0100): Letter sprites (8x8), 21 of them (A-U). Standard-looking font, not the LS one. Possibly test data?
-
0x4a0e: Unknown value (4c = 76). Possibly checksum.