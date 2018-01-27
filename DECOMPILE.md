TZX Overview
------------

10-byte header

Hunks like:

`10 mm mm ll ll <ll ll bytes>`

`30 ll <ll bytes>`

Spectrum hardware notes
-----------------------

Despite only 48KB of RAM, the whole 64KB address space is available... with the
bottom 16KB being ROM, so in practice 0x4000-0xffff are memory addresses and
0x0000-0x3fff are system calls.

16-bit work was fairly well supported at the time on 8-bit CPUs, but the
convention was quite heavily biased towards 8-bit where possible. FPUs were
unheard-of at the time and floating point had not yet been standardised so
fractional numbers were barely used and where present would have been fixed
point in most cases. Performance for division would have been quite poor,
although the actual CPU speed would have been in the low megahertz.

The CPU in use, Zilog Z80, was a clone of Intel's 8080 (predecessor to 8086, 386
and ancestor of current x86-64 architecture) and so is not as alien in terms of
instruction set or behaviour as you might expect. At the time, 16-bit numbers
were "little-endian", which is to say the smallest byte always came first,
presumably in an effort to simplify expanding 8-bit numbers to 16-bit.

Most games came on cassette tapes and took a couple of minutes to load, with the
data both audible and in most cases also displayed on the screen. Cassette
capacity was typically far larger than memory so there was rarely a need to
optimise specifically for storage, and optimisations present would have been
intended to keep the memory footprint under control. Compression was known, but
would have performed very poorly, provided little advantage, and was not well
understood at the time. Tapes and tape drives were relatively prone to failure,
so there would have been some value in including integrity checks in the data.

Images were essentially 1bpp with foreground/background colour attributes tiled
over the top in 8x8 chunks; earlier computers were often text-only so this would
have been relatively familiar to existing programmers, although there apparently
wasn't any specific requirement to pretend that each 8x8 chunk was a character.
Higher resolution and greater colour was possible through the expected video
output device (a PAL TV) but would have required much more RAM and a faster DAC.

Fully compiled languages existed, but would have been fairly expensive, poorly
optimised and slow to compile. Interpreted languages, specifically BASIC, were
popular and inexpensive but notoriously inefficient. Most games were written in
assembly and directly translated to the underlying machine code.

Joysticks existed and were fairly popular, but were prone to mechanical failure
and were seen by some as an extravagance; mice also existed but were barely
understood at all by the consumer market. Where a game needed to use directional
control, it generally used Q, A (up, down), O and P (left/right) or Z, X, K and
M. Space and enter were common action keys.

Pre-scenario
------------

0101; DATA
5aff; DATA
5b00; DATA
5b01; DATA
5b02; DATA
5b7a; DATA
5b97; DATA
5b99; DATA
5c0a; DATA
5c50; DATA
5cfe; DATA
5cff; DATA
5d00; DATA
5d24; DATA
5d25; DATA
5d26; DATA
5d2f; DATA
5d33; DATA
5d36; DATA
5d37; DATA
5d3a; DATA
5d3b; DATA
5d3e; DATA
5d47; DATA
5d49; DATA
5d59; DATA
5d62; DATA
5d8f; DATA
5d9b; DATA
5dc2; DATA
5dd6; DATA
5dd8; DATA
5df8; DATA
5dfb; DATA
5dfd; DATA
7091; DATA
7093; DATA
a54b; DATA
a54d; DATA
a578; DATA
a5ca; DATA
a5da; DATA
a5dc; DATA
a5de; DATA


General
-------

Tiles are 16x16 in 2 colours of roughly 7. Rock tile is on-off dithered. Several
other tiles use an on-off pattern in places.

Header hunk looks very much like a trampoline, or rather call stubs. That
explains neatly why it's always multiples of 3 bytes and why the padding is zero
(NUL). Since they are absolute jumps it's unclear where - or if - they refer to
the same file. The first byte is apparently not a CPU instruction, nor
apparently is the last.

Maps appear to always start at exactly 0x209f, similarly sprites and sprite
offsets are always in the same place. Strings are not. It's likely that content
before the end of strings relates principally to tiles, and content after the
map starts relate to the map and visual representations.

There are no general-purpose (ie, walking) animation frames

0x1d7f-0x209e seems to reliably be unit stats (which also means exactly 20 units
per mission)

Tail of each file appears to be padded with 8x8 sprites A-U; there may be 1+ 8x8
sprites following the last 16x16 sprite and then `n` unpredictable data.
Scenario 5 ends 16x16 at 0xaf then noise until it resumes 8x8 (T & U) halfway
through 0xb8. Scenario 1 on the other hand appears to use proper 16x16 all the
way to 0xb8.

Minimap is EITHER 16x12 16x16 pixels (192/0xc0 bytes) OR 32x24 8x8 pixels
(768/0x300 bytes). Or in principle 32x192 raw bytes (6144/0x1800 bytes), but
there's nowhere near enough unaccounted space for that.

Although the alt map doesn't seem to be used (perhaps it's mainly for testing)
it's possible that it feeds the minimap, in which case the latter may not have
its own representation.

Objects:

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

Unit stats (0x1d7f-0x209e):

To find: Movement type (different between humans and droids...); Wounds (possibly), although it may be inferred from constitution; Wound rate, likely to be 1/4-1/2 constitution; possibly "unarmed combat" although that may actually be "close combat"; possibly "burden", although that is inferred; One of morale value or victory points is not yet located

00: Side number or equivalent
22: ?? Unclear but may be tied to rank/unit type. "Morale value" or "victory points"?
05: ?? Type? 5 = human, 6 = droid
7f: Dead unit sprite
00: ? Tends to be in the 0/1 range
31: ?
2f: ?
23: Constitution
23: Constitution
a7: Stamina

a7: Stamina
b2: Morale
b2: Morale
14: ? Usually 14 (20) - base armour front?
10: ? Usually 10 (16) - base armour left?
0c: ? Usually 0c (12) - base armour back?
10: ? Usually 10 (16) - base armour right?
02: ? Usually 02 (2)
32: Weapon skill
08: Close Combat

2e: Strength
30: Agility
00: ?
00: ?
06: ? May be aligned to side or type
09: ?
02: ?
3a: Action points
ff: ?
00: ?

00: ?
00: ?
00: ?
04: ?
00: ?
00: Weapon entity
00: ? Ammo maybe?
00: ?
5a: ?
12: ?

Header hunk at 0x00-0x2c:

68
i: c3 9b b8
ii: c3 29 bf
iii: c3 77 c1
iv: c3 13 c2
v: c9 00 00
vi: c3 67 ff
vii: c9 00 00
viii: c9 00 00
64 ...

This is always exactly the same length despite quite different content. Each triple starts with 0xc?.

Chunk (i) is always c3 xx b8; with b8 being the number of sprites, this may in
some way represent the sprite section. Middle number is 9b-d3, which is to say
"pretty big". With little-endian numbers, this might also be a fairly closely
bounded 16-bit number. It might or might not be signed.

Chunk (ii) is c3 xx be or c3 xx bf. be ranges b9-d1, and bf ranges 29-97.

Chunk (iii) is c3 xx c1, ranging 37-f1.

Chunk (iv) is c3 xx c1 or c3 xx c2. c1 is cf-f2, and c2 is 13-8d

Chunk (v) is c9 00 00 in three scenarios, and a c3 chunk otherwise. This might
be used to express "well it's not there" or perhaps some default value.

*Some* c3 chunks end with 0xff, and in one case this isn't the terminal c3 chunk
(between ebc1 and 09cc). The chunks are mostly, but not always, in order with
respect to the last number. The highest sane value, if little-endian, is 0xcc09
= 52233, outside the 48K limit for onboard memory and beyond the 19K of the tape
section. If it's negative, it's ~-19500, which is potentially within memory
bounds but unlikely and beyond the size of the tape part. There isn't virtual
memory present, but the 8086-compatible z80 may have the concept of data
segments, which the second byte may refer to in an abstract way; or of course it
may be done manually.

The annoyance here is that one of the scenarios (5) has simply crazy numbers:

c3 [d3 b8], c3 [97 bf], c3 [f1 c1], c3 [8d c2], c3 [24 cb], c3 [df fe]

The fact that fe is even present here says "negative number" quite strongly, but
again that would mean that they are all negative - clearly unlikely.

With the expected 16KB (2^14) addressable chunks, the first 2 bits (expressing
0xc-0xf) may be irrelevant or reused for some special purpose.

The only second digit values are b8, be, bf, c1, c2, cb, cc, fe, ff. They're
quite distinctively discontiguous, but there isn't any clear meaning for this.

The head and tail numbers don't impart clear meaning; scenarios 1-5 pretty much
increment the first value (as 0x64-0x69 with a gap before scenario 4) and then
6-7 do again from the beginning. The last value is close to the first in most
cases (no strong order) except for outliers of 0x3c (scenario 1) and 0xd4
(scenario 7).

Sequences at 0x2d-0x3d:

i: ae ad ac ab
ii: ff
iii: 84 85
iv: 02 03 04 05 06 07 08
v: 64 64

(i) is sprites representing an enlargening circle, purpose unclear

(ii) is always ff. This almost certainly is an end-of-sequence marker, but since
it's always the same it doesn't really matter.

Sequence (iii) is the explosion sprites in the order small, big.

Sequence (iv) starts at 1, 2 or 3 (scenarios 3 & 4 -> 2, scenario 5 -> 3) and is
of length 4 (scenario 1) or 7 only. Given the sprite data before this, it could
be animation-related.

The final two (v) are always 00 or 64. It's reasonable to speculate that theyare
percentages which are in practice expressing a boolean on/off value;
unfortunately this means they are quite unlikely to be understood from
non-invasive analysis. The simplest guess is that it's the percentage of
*something* that each side receives.

Deployment replacement hunk: This always starts at 0x3d BUT is not always of the
same length. It's not clear if the following block of "ffff" serves as padding.
Scenario 5 actually has only one of these, but it also has only one deployment
zone.

Hunk at 0x44 or 0x41 or 0x47: ...

Hunk c4-d7: There are 20 entries here, which naturally map to the soldier entity
list and are broadly consistent with the soldier type. It's not clear why this
is outside the main entity data. Almost always (thanks scenario 5) starts with
05, and all values are 2, 4, 5 or 6. (5 is clearly the standard case).

Hunk de-e0: possibly another set of side credits, appearing everywhere but
scenario 1. Examples: 69 64 50 (105 100 80), 82 6e 5a (130 110 90) be af 9b (190
175 145).

Hunk e1-e3: ff 46 44 (255 70 68), 50 46 45 (80 70 69), 46 45 44 (70 69 68), 2d 46
45 (45 70 69). Apparently neither sprite nor map entity refs. Numbers 44, 45, 46
often appear. The prevalence of 0x46 may suggest a human-digestible value. No
strong order, so some kind of entity reference is likely and difficulty-level data is unlikely.

Hunk e4-e5: 01 00 / 00 01 / 00 00. No clear semantics.

Hunk e6-f5: nulls

Hunk f6-fb: Always 5f e6 0a 00 00 00 (95 230 10 or 95 2790). Probably not a
signature at this location, but may refer to something that's practically common
between scenarios, eg. the map size.

fc-10b: Apparently a series of 16-bit numbers, but plain number pairs are
possible. Example: e5 c2 25 c3 85 c3 8d c3  4a c5 45 cc d9 ce 69 d0. Fairly well
bounded, fairly similar between scenarios. As with some other values, these
COULD be memory offsets, but they are too high to be literal and unlikely to be
negative.

0x10c-0x111: nulls, probably padding

0x112-?:

i: 32 2e b7 4f 21

ld [0xb72e], a
ld c, a
ld hl, ...

First 5 values (50 46 185 79 33) are always the same, and again this should be
coincidentally common data. There are 0xb7 defined sprites, although this is in
the range 0x00-0xb8.

ii: 16 c8

..., 0xc816

Apparently a 16-bit number

iii: 3a 31 b7 47 7e e6  7f 5f 16 00 19 10 f7 23 22 2f b7 09 09 7e cb 7f  c0 e5
cd 78 b7 e1 20 0c...fb a7 c9 32 00 00 00

ld a, [0xb731]
ld b, a
ld a, [hl]
and 0x7f

0x119-0x16a (80 bytes) Also always the same. At 640 bits, that's enough for 10 x
8 x 8 or 5 x 8 x 16 sprites, possibly the word "SCENARIO". It starts very similarly to the previous constant 5 bytes, so possibly represents a similar thing. With the values being numerically close more than bitwise they might literally be numbers. There are some hints of 5-byte alignment, but the same is true of 8-byte.

iv: 21 01 5b 22 2c

Five varying bytes

v:  b7 21 01 5b

Another 4 identical bytes

The sequence "21 01 5b 22 2c b7  21 01 5b 36 ff 11 02 5b..." appears in both scenario 1 and 2 at different offsets: scenario 1 has "00 3e 00 32 8b b7" as a prefix. Given the precision involved, any default sequence length may be 6.

As well as the obvious imagery, variable-length sequences could represent strings... or code.

21 01 5b -> ld hl, 0x5b01
22 2c b7 -> ld [0xb72c], hl
36 ff -> ld [hl], 0xff
11 02 5b -> ld de, 0x5b02

...

5d cd af 60 21 ff 5c 34 34 c1
10 f0 3a fe 5c c6 02 32  fe 5c 3e 01 32 ff 5c c1
10 dd 32 15 b7 3e 65 cd  5e 67 c9 32 01 01 01 01
01 01 01 01 01 01 01 01  01 01 01 01 01 01 01 01
01 01 01 01 01 01 01 01  01 01 01 01 01 02 00 00
02 04 05 02 00 00 00 00  00 00 01 00 00 00 00 00

ld e, l
call 0x60af
ld hl, 0x5cff
inc [hl]
inc [hl]
pop bc (?? c1)
djnz (~0xf0 -16?)
ld a, [0x5cfe]
add a, 0x02
ld [0x5cfe], a
ld a, 01
ld [0x5cff], a
pop bc
djnz (~0xdd -66?)
ld [0xb715], a
ld a, 0x65
call [0x675e]
ld h, a
ret

The presence of literal code here is far from unprecedented for the time - a
"level" would commonly have its own code - but the size is a bit surprising
since it should pretty much just be the scenario objectives which need custom
code. The trampolines present at the start of the file present an ABI as needed
to access the scenario code itself.