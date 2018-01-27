Scenario 1
----------

Full-screen image loading appears to be line 0, line 8, line 16..., line 1, line
9, line 17... and then colours at the last second, at least for direct loading
from tape

Information voids:

0x0000-0x002c: header with possible offsets
0x0035-0x003c: low number sequence
0x00c4-0x00d7: repeated numbers, likely coarse soldier properties
0x00de-0x0111
0x0bfd-0x0cff
0x1120-0x1483 ~0.5KB
0x1988-0x1997 16B
0x1b2c-0x1cde ~0.25KB

Equipment entities start at 6e in the entity list

32 64 bd / 3a 64 bd appears multiple times
cd 6a 72 appears multiple times

0x00~0x1b (header):

64
c3 9f b8
c3 ca be
c3 4c c1
c3 e4 c1
c9 00 00
c9 00 00
c9 00 00
c9 00 00
3c 00 00

So that's jumps to 0xb89f, 0xbeca, 0xc14c and 0xc1e4. Not clear currently if
that's even in the file.

(nulls)

0x002e-0x0038: Short sequence a5 a6 a7 a8 ff 98 97 01 02 03 04. Possibly an entity order hint.

(nulls)

0x003e-0x0046: Deployment zone replacements. Three 3-byte values: 6b 00 33, 6c 00 21, 6d 01 01. These are deployment entity, side that gets to use it, replacement entity.

0x0047-0x0064: Possible equipment attribute list

ff ff ff ff ff ff ff ff ff 1f 1f 1f 1f 1f 1f 1f 1f 1f 1f 1c 18 10 00 00 00 00 00 00 1f 04

ff = weapon
1f = ammo/key/general carried?
1c = droid-only weapon
18 = droid remains 2??
10 = ??????
04 = ??????

0x0065-0x0082: Side 1 equipment costs, in order; apparently skipped values (key) have 0xff.

0x0083-0x00a0: Side 2 equipment costs, in order

(nulls)

0x00a6: Equipment entity offset?

(nulls)

0x00a8-0x00c3: Armour ratings/costs. 0a=f 08=l 08=r 06=b 01=weight 60="carry"? 06=cost

0x00c4-0x00d7: 05 x 5, 04 x 5, 00 x 9, 06 x 1. Possibly related to the unit list (last one in the list is the sole side-2 human unit, first 5 are the side-1 humans)

0x00d8-0x00da: Side 1 credits (2p); side 2 credits (2p); side 1 credits (1p)
0x00db-0x00dd: Side 1 credits (difficulty 2, 3, 4)

(nulls)

0x00e1-0x00e4: Unknown data (14 46 45 01)

(nulls)

0x00f6-0x00f8: Unknown data (5f e6 0a)

(nulls)

0x00fd-0x010c: 8x number pairs: c2 20, c3 40, c3 4c, c3 30, c5 a4, ca a8, cf 4c, d1 00

0x0112-0x0bfc: z80 code

0x0bfd-0xc9f: ??

0x0ca0: Three 32-byte sequences. Purpose isn't clear. There's 01 mapped as 01110111000000000000000000000000, and otherwise 02 x 32 and 03 x 32.


0x0d00: Rotation maps
0x0d20: Death animations
0x0d2c: String mapping starts
0x0f22: Strings start
0x111f: Strings end

0x1120-0x126b: length-tagged values. Ends with a plain 0x80.

81
85 02 07 08 05
87 01 07 03 05 07 05
87 02 05 06 0b 07 04
83 05 01
87 04 01 09 04 0a 04
85 03 0b 1f 11
8b 02 05 03 04 0b 04 0f 05 15 08
85 01 05 30 0d
87 05 04 12 05 13 06
85 05 04 14 06
87 07 04 0c 01 0f 03
85 0b 01 31 03
89 32 04 31 03 11 04 0e 01
83 0d 01
89 07 05 0b 03 10 01 15 04
87 0f 01 11 06 15 04
89 0d 04 10 06 17 04 32 01
87 09 05 13 01 14 01
85 09 06 12 01
89 0a 06 12 01 16 02 1b 04
8d 07 08 0f 04 10 04 16 02 18 02 1b 05
87 14 02 15 02 18 03
89 32 03 11 04 1a 03 1d 04
87 15 02 16 03 1b 04
85 1a 04 24 09
87 17 03 19 04 1c 02
8b 14 04 15 05 18 04 1e 03 22 06
85 1a 02 1d 02
85 17 04 1c 02
89 1b 03 20 02 21 04 22 04
85 06 11 2c 0e
85 1e 02 23 04
85 1e 04 23 04
87 1b 06 1e 04 25 04
85 20 04 21 04
87 19 09 27 03 2a 05
85 22 04 26 01
85 25 01 28 02
85 24 03 29 03
87 26 02 29 05 2d 04
89 27 03 28 05 2a 04 2d 05
85 24 05 29 04
85 30 0d 2e 06
85 1f 0e 2f 09
89 28 04 29 05 2e 01 2f 01
87 2b 06 2d 01 2f 02
87 2c 09 2d 01 2e 02
85 08 0d 2b 0d
85 0c 03 0d 03
87 0d 04 11 01 17 03
80

There are 52 of these (50 excluding top and bottom). All lengths are odd, which
means these are probably 2-byte values. Cap(2n) is 0x32 (50), cap(2n+1) is 0x11
(17), min is 0x01. These may be map coordinates for hard-coded paths? If so it's
a bit unclear what the single-value sequences mean. First value could be
self-referential. If the map is 80x50 (which it is) and the coordinates are in
traditional order, only a small fraction of the map is covered (trivially, 850
of 4000 squares). Given the cap at 50 and the expectation that these values
would be precise, the first value MAY be a Y coordinate and the the second a
delta X coordinate.

Distribution is hard as fuck with ~20x 1-6 and everything else tiny by
comparison (values are very much contiguous).

Value 1 is a roughly even distribution of 2-4 instances, with bumps at 0x07 (5x),
0x15 (6x) and 0x1b (5x). Contiguous. A few values like 0x04 exist only once.

Value 2 is around 2x 1-5, except 40x 4 and 10x 6. Relatively sparse numbers
afterwards at 2x or 4x. ALL numbers appear an even number of times. Not
continguous, as 0x0a, 0x0c, 0x0f and 0x10 do not appear. Highest is 0x11,
meaning there are 17 values in the range 1-17 (possibly 18x if there is a hidden
0 value).

0x126c-0x12f7: 28x 5-byte values ending in a typically-incrementing number

20 23 1f 23 01
1c 20 21 22 02
19 1c 1e 22 03
14 19 20 27 04
0e 14 1d 27 05
10 12 27 2c 06
12 19 27 2c 07
13 15 2c 32 08
15 19 2c 30 09
15 19 30 33 0a
15 17 33 37 0a
11 17 37 3c 0b
0f 15 32 39 0c
17 1c 33 3a 0d
19 1b 2a 33 0e
1b 1e 2a 2b 0e
1e 22 28 2d 0f
20 21 23 28 10
19 20 22 2a 11
17 24 36 42 12
1b 27 26 36 13
1f 27 15 26 14
11 1f 13 21 15
08 11 13 26 16
08 13 26 34 17
08 11 34 43 18
11 17 3c 47 19
ff 0d 1b 14 1b

Value+3 often shifts left one, typically in earlier parts of the set. Value+1 is
common in a couple of places, as is value+0. Value+3 caps at 0x47 (73). End
numbers *may* be self-referential because they're in the same general bound as
the number of items (1c, noting that 0a and 0e are repeated and 1a is missing).

0x12f8-0x1351?: Number pairs, 45 or more of them, 0c-24 (12-36) with 1c-3d
(28-53). Strongly ordered by the second value followed by the first (ie, same as
ordered 16-bit little endian).

0x1484-0x1987: Fixed tile attributes (107x)

04 04 04 ff 00 00 00 00 00 00 00 00
04 04 04 64 00 00 00 00 00 00 00 00
ff ff ff 78 63 78 00 00 00 00 00 00
ff ff ff 78 60 78 00 00 00 00 00 00
ff ff ff 78 67 78 00 00 00 00 00 00
ff ff ff 78 66 78 00 00 00 00 00 00
ff ff ff 78 64 78 00 00 00 00 00 00
ff ff ff 78 65 78 00 00 00 00 00 00
ff ff ff 78 63 78 00 00 00 00 00 00
ff ff ff 78 64 78 00 00 00 00 00 00
ff ff ff 78 65 78 00 00 00 00 00 00
ff ff ff 78 62 78 00 00 00 00 00 00
...
06 06 06 ff 00 00 00 00 00 00 00 00
06 06 06 ff 00 00 00 00 00 00 00 00
06 06 06 ff 00 00 00 00 00 00 00 00
06 06 06 ff 00 00 00 00 00 00 00 00
06 06 06 ff 00 00 00 00 00 00 00 00
06 06 06 ff 00 00 00 00 00 00 00 00
06 06 06 ff 00 00 00 00 00 00 00 00
ff ff ff 3c 59 3c 00 00 01 6a 7d 2b // unlocked door
04 04 04 14 00 00 00 00 00 00 00 00 // door remains
04 04 04 42 59 42 00 00 02 68 00 00 // open door

Initial three may be per-side movement costs (ff being impassable)

ff: ?Crossing cost...? 8 for one "shower" tile
ff: ?Crossing cost...? ff for one "shower" tile
ff: ?Crossing cost...? 8 for one "shower" tile
3c: ?Constitution? Probably not since this is 0x64 for "floor"; 50 for "shower"
59: Destroyed entity
3c: ?Constitution? 05 for "shower"; 00 for "flowers"
00: ?? 04 for "shower", 03 for "bush", 06 for "reed plant", 01 for "little bush", 02 for "comfy chair"
00: ??
01: ?Action? 1 == open; 2 == close; 3 == unlock?; 7 == ??vidi-screen/control console??; 9 == ??shower/bush/reed plant??
6a: New entity | other (shower, vidi-screen, bush, reed plant) | action entity (locked door)
7d: Key entity (literally, "key")
2b: Locked entity | unlocked entity (locked door)

0x1988-0x1997: 16 bytes with no clear meaning

03 0a 0c 02 04 28 08 05 0a 20 10 10 28 60 05 2e

0x1998-0x1b2b: portable item properties, 20b each (420b). Might start 20b earlier.

?? __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ ?? __
03 0a 0c 02 04 28 08 05 0a 20 10 10 28 60 05 2e 77 6a ff 0c // m4000
03 0c 0e 02 04 26 0a 05 0b 20 12 10 2d 80 05 3a 78 74 ff 0c // marsec
03 07 08 01 05 34 08 05 08 18 1a 0c 38 00 00 34 7e 62 ff 08 // sniper
03 06 04 00 05 32 06 06 06 40 0a 20 16 00 00 28 79 64 ff 0e // marsec pistol
03 10 0e 02 03 22 0a 06 0a 28 0c 10 18 a0 04 1e 7a 78 ff 10 // l50
03 1c 22 03 02 18 0b 06 0f 30 0a 18 10 f0 03 2d 7b 7e ff 10 // heavy laser
07 0c 16 03 02 1a 09 07 0c 18 0a 0c 12 00 00 a0 7c 56 ff 14 // rocket launcher
08 02 02 00 00 00 00 00 00 00 00 00 00 00 00 5a 00 3c 00 00 // grenade?
01 01 02 00 06 3a 14 08 03 00 00 00 00 00 00 00 00 3c 00 00 // dagger?
20 02 02 00 00 00 00 00 00 00 00 00 00 00 00 00 14 2d 00 00 // ammo??
20 03 02 00 00 00 00 00 00 00 00 00 00 00 00 00 14 2e 00 00 // ammo??
20 02 01 00 00 00 00 00 00 00 00 00 00 00 00 00 08 20 00 00 // ammo??
20 03 04 00 00 00 00 00 00 00 00 00 00 00 00 00 28 18 00 00 // ammo??
20 05 08 01 00 00 00 00 00 00 00 00 00 00 00 00 32 1c 00 00 // ammo??
20 04 04 01 00 00 00 00 00 00 00 00 00 00 00 00 01 12 00 00 // ammo??
00 01 01 00 00 00 00 00 00 00 00 00 00 00 00 00 00 20 00 00 // key?
20 02 02 00 00 00 00 00 00 00 00 00 00 00 00 00 0c 14 00 00 // ammo?
00 50 3c 06 00 00 00 00 00 00 00 00 00 00 00 00 00 60 00 00 // body?
00 78 42 06 00 00 00 00 00 00 00 00 00 00 00 00 00 8c 00 00 // body?
02 0c 0c 00 00 00 00 00 00 20 14 10 2c 80 08 32 ff a0 ff a0 // m7000?
00 82 46 06 00 00 00 00 00 00 00 00 00 00 00 00 00 82 00 00 // body?


03: ??Type hint??
0a: Weight
0c: Size
02: Crossing cost
04: Close combat cost (as 1/n)
28: Close combat accuracy %
08: Close Combat damage
05: Close combat strength bonus (as 1/n)
0a: Close combat agility bonus (as 1/n)
20: Snap shoot cost (as 8/n)
10: Snap shot accuracy
10: Aimed shot cost (as 8/n)
28: Aimed shot accuracy
60: Auto-shot cost (as 8/n)
05: Auto-shot accuracy
2e: Ranged combat damage factor
77: Ammo type | capacity
6a: Constitution
ff: ??Weapon/other hint?? Only 0x00 and 0xff seen
0c: Skill factor (as 1/n)

0x1b2c-0x1bdf: 30 6-byte values, probably starting equipment

6e 00 00 00 14 8c
6e 00 00 00 14 8d
6e 00 00 00 14 8e
6e 00 00 00 14 8f
6e 00 00 00 14 90
77 00 00 00 14 8c
77 00 00 00 14 8d
77 00 00 00 14 8e
77 00 00 00 14 8f
77 00 00 00 14 90
75 00 00 00 ff 8c
75 00 00 00 ff 8d
75 00 00 00 ff 8e
75 00 00 00 ff 8f
75 00 00 00 ff 90
81 00 00 00 20 91
81 00 00 00 20 92
81 00 00 00 20 93
81 00 00 00 20 94
81 00 00 00 20 95
81 00 00 00 20 96
81 00 00 00 20 97
81 00 00 00 20 98
6f 00 00 00 14 9f
78 00 00 00 14 9f
78 00 00 00 14 9f
76 00 00 00 00 9f
71 00 00 00 08 9f
75 00 00 00 ff 9f
75 00 00 00 ff 9f

6e: A weapon/ammo entity
00: ??
00: ??
00: ??
14: ? Commonly 8, 20 or 32 - could be current ammo
8c: A unit entity

(nulls)

0x1cdf-0x1d7e: 160 1-byte values, corresponding to the map entity list. These
are a 5-bit value identifying the minimap entity (a number 0-13) followed by a
3-bit value of unclear meaning. While these may be in-program sprites, they are
contiguous here so there's a reasonable chance they're in-map. with 13 or 14 of
these, that's a possible 117-130 bits (~15-17 bytes), although some compression
is to be expected. Wherever they're stored, with long bit offsets being
extremely improbable they should be 16B little-endian values rammed on the
right, so they should appear as:

00 00
?? ??
?? ??
38 00
92 00
30 00
18 00
1a 00
32 00
38 00
1a 00
3a 00
32 00
3a 00
10 00
ff 01
c8 00
0b 00
26 00
c0 01

Special cases for the bottom three bits are:

```
(various): 00 (0 = 000)
37: 1c (4 = 100) Window
42: 1c (4 = 100) Window
90: 26 (6 = 110) Window (vertical)
91: 26 (6 = 110) Window (vertical)
92: 1c (4 = 100) Window (broken)
93: 1c (4 = 100) Window (broken)
104: 72 (2 = 010) Door (unlocked)
140-144: (0 = 000) Side 1
145-159: (2 = 010) Side 2
```

There doesn't appear to be any strong meaning here. With bit 0 routinely off,
that may mean "blocks vision" with the remaining bits indicating how you can see
past (3 = l-r, 2 = t-b, 1 = ?). The unlocked door is a bit of an oddity in this.s

0x1d7f-0x49de: Unit data, map data etc

Full 185 sets of sprite data