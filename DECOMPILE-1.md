# Scenario

Full-screen image loading appears to be line 0, line 8, line 16..., line 1, line
9, line 17... and then colours at the last second, at least for direct loading
from tape

Information voids:

0x0019
0x0035-0x003c: low number sequence
0x00c4-0x00d7: repeated numbers, likely coarse soldier properties
0x00de-0x010b
0x0bfd-0x0cff
0x1120-0x1483 ~0.5KB
0x1988-0x1997 16B
0x1b2c-0x1cde ~0.25KB

Equipment entities start at 6e in the entity list

32 64 bd / 3a 64 bd appears multiple times
cd 6a 72 appears multiple times

0x00: Single byte: 64

0x01-0x18: Trampolines

b621(0001)     c39fb8 JP x6:&b89f
b624(0004)     c3cabe JP x7:&beca
b627(0007)     c34cc1 JP x8:&c14c
b62a(000a)     c3e4c1 JP x9:&c1e4
b62d(000d)         c9 RET
b630(0010)         c9 RET
b633(0013)         c9 RET
b636(0016)         c9 RET

b639(0019): ?

b63a(001a): Up to 115 bytes of data - thus ending by b6ae(008e). In practice this may end significantly sooner, since the only known criteria are that offsets are n-8c and ff is not considered valid. This relates to 5b00, 5b99, 5d26 all of which may contain "8c offsets". Since those offsets aren't static, it's likely that they are related in common cases.

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

b713(00f3)            ; DATA - byte from 8c set
b714(00f4)            ; DATA
b715(00f5)            ; DATA

0x00f6-0x00f8: Unknown data (5f e6 0a)

(nulls)

0x00fd-0x010b: 7-8x number pairs: c2 20, c3 40, c3 4c, c3 30, c5 a4, ca a8, cf 4c, d1

## Find b787 at or after offset A in entry b731 in the 8x lists

```
b72c(010c)            ; DATA - memory offset IN
b72e(010e)            ; DATA - OUT (original A - starting distance)
b72f(010f)            ; DATA - memory offset LOCAL
b731(0111)            ; DATA - IN entry number
b732(0112)     322eb7 LD (&b72e),A
b735(0115)         4f LD C,A
b736(0116)     2140c7 LD HL,&c740
b739(0119)     3a31b7 LD A,(&b731)
b73c(011c)         47 LD B,A
b73d(011d) a:      7e LD A,(HL)
b73e(011e)       e67f AND &7f
b740(0120)         5f LD E,A
b741(0121)       1600 LD D,&00
b743(0123)         19 ADD HL,DE
b744(0124)       10f7 DJNZ a:-7
b746(0126)         23 INC HL
b747(0127)     222fb7 LD (&b72f),HL
b74a(012a) c:      09 ADD HL,BC
b74b(012b)         09 ADD HL,BC
b74c(012c)         7e LD A,(HL)
b74d(012d)       cb7f BIT 7,A
b74f(012f)         c0 RET NZ
b750(0130)         e5 PUSH HL
b751(0131)     cd78b7 CALL &b778
b754(0134)         e1 POP HL
b755(0135)       200c JR NZ,b:14
b757(0137) d:  212eb7 LD HL,&b72e
b75a(013a)         34 INC (HL)
b75b(013b)         4e LD C,(HL)
b75c(013c)       0600 LD B,&00
b75e(013e)     2a2fb7 LD HL,(&b72f)
b761(0141)       18e7 JR c:-23
b763(0143) b:  3231b7 LD (&b731),A
b766(0146)         23 INC HL
b767(0147)   fd2a2cb7 LD IY,(&b72c)
b76b(014b)     fd7eff LD A,(IY+-1)
b76e(014e)         86 ADD A,(HL)
b76f(014f)     2187b7 LD HL,&b787
b772(0152)         be CP (HL)
b773(0153)       30e2 JR NC,d:-28
b775(0155)         47 LD B,A
b776(0156)         af XOR A
b777(0157)         c9 RET
```

So this finds entry (b731) in the 8x lists, starts at word A looking for words where the first byte is < (b787). If it's found, you get Z and the number in B; if it's not, you get NZ. This excludes any first bytes which are in 5b01<3>. b72e is the distance last tested.

There's an odd cross-jump in here which may suggest that the code was rushed or copied from elsewhere, broadly:

```
loop:
    ...
b:
    if x goto c
    next a
    goto loop
c:
    ...
    if y goto b
d:
    ...
```

This could easily have been:

```
loop:
    ...
b:
    if !x goto c
    ...
    if !y goto d
c:
    next a
    goto loop
d:
    ...
```

NOTE: b731 gets written to/read from willy-nilly elsewhere, but there's only one caller which definitely DOES set b731. It's likely that the semantics make it "make sense" to use b731 as scratch space for certain purposes.

## Is A in 5b01<3>

```
b778(0158)     21015b LD HL,&5b01
b77b(015b)     110300 LD DE,&0003
b77e(015e)       0632 LD B,&32
b780(0160) a:      be CP (HL)
b781(0161)         c8 RET Z
b782(0162)         19 ADD HL,DE
b783(0163)       10fb DJNZ a:-3
b785(0165)         a7 AND A
b786(0166)         c9 RET
```

Finds the first triple-byte from 0x5b01 where the first byte equals a; if it's not in the first 50, returns anyway.

Modifies: hl, de, b, a

In: A

Effective return: flags(Z if found).

## Build route(?)

b787(0167)            ; DATA
b788(0168)            ; DATA - byte, IN - map coordinate offset?
b789(0169)            ; DATA - byte, IN - map coordinate offset?
b78a(016a)            ; DATA - byte, LOCAL - step counter
b78b(016b)            ; DATA - byte, OUT
b78c(016c)       3e00 LD A,&00
b78e(016e)     328bb7 LD (&b78b),A
b791(0171)     21015b LD HL,&5b01
b794(0174)     222cb7 LD (&b72c),HL
b797(0177)     21015b LD HL,&5b01
b79a(017a)       36ff LD (HL),&ff
b79c(017c)     11025b LD DE,&5b02
b79f(017f)     019500 LD BC,&0095
b7a2(0182)       edb0 LDIR

b78b=0

(b72c)=5b01

Set 5b01-5b95 (150 bytes) to ff

This is clearly some kind of (re-)initialisation.

b7a4(0184)     3a88b7 LD A,(&b788)
b7a7(0187)     cd3fb8 CALL &b83f
b7aa(018a)     cd52b8 CALL &b852
b7ad(018d)     327bb8 LD (&b87b),A

b87b=box for (c912 + 2*(b788))

b7b0(0190)     3a89b7 LD A,(&b789)
b7b3(0193)     cd3fb8 CALL &b83f
b7b6(0196)     cd52b8 CALL &b852
b7b9(0199)     327cb8 LD (&b87c),A

b87c=box for (c912 + 2*(b789))

b7bc(019c)     217bb8 LD HL,&b87b
b7bf(019f)         be CP (HL)
b7c0(01a0)       2004 JR NZ,a:6
b7c2(01a2)       3e19 LD A,&19
b7c4(01a4)       1803 JR b:5
b7c6(01a6) a:  cd7db8 CALL &b87d
b7c9(01a9) b:  3287b7 LD (&b787),A

If box[1]==box[2], b787=25; else b787=box pair mapping.

25 (0x19) is a value which is in the box pair map, so it's likely that this is a "sane default".

b7cc(01ac)         af XOR A
b7cd(01ad)     32005b LD (&5b00),A
b7d0(01b0)     328ab7 LD (&b78a),A
b7d3(01b3)     3a88b7 LD A,(&b788)
b7d6(01b6)     3231b7 LD (&b731),A

5b00=0; b78a=0; b731=b788

b7d9(01b9)  d: 3a31b7 LD A,(&b731)
b7dc(01bc)     2a2cb7 LD HL,(&b72c)
b7df(01bf)         77 LD (HL),A

((b72c))=(b731)

b7e0(01c0)     3a89b7 LD A,(&b789)
b7e3(01c3)         be CP (HL)
b7e4(01c4)       2838 JR Z,a:58

Jump if (b731)==(b789)

b7e6(01c6)         23 INC HL
b7e7(01c7)         34 INC (HL)

((b72c+1))++

b7e8(01c8)         7e LD A,(HL)
b7e9(01c9)         e5 PUSH HL
b7ea(01ca)     cd32b7 CALL &b732
b7ed(01cd)         e1 POP HL

Find b787 at or after offset ((b72c+1)) in entry b731 in the 8x lists

b7ee(01ce)       2010 JR NZ,b:18

Jump if not found

b7f0(01d0)     3a2eb7 LD A,(&b72e)
b7f3(01d3)         77 LD (HL),A
b7f4(01d4)         23 INC HL
b7f5(01d5)         70 LD (HL),B
b7f6(01d6)         23 INC HL
b7f7(01d7)     222cb7 LD (&b72c),HL
b7fa(01da)     218ab7 LD HL,&b78a
b7fd(01dd)         34 INC (HL)
b7fe(01de)       18d9 JR d:-37

((b72c+1))=(b72e)
((b72c+2))=B
(b72c)+=3
b78a++
Jump back (loop)

So in this scenario, (5b01) is a triple-byte of {iterations-until-found, distance, result} all applicable to the 8x list.

b800(01e0) b:  3a8ab7 LD A,(&b78a)
b803(01e3)         b7 OR A
b804(01e4)         c8 RET Z

So, if b78a==0, return. Since it's +1 when stepping forward and -1 when stepping back, this is the length of the list at (5b01); it's possible that the b732(NZ) case naturally follows from a list entry, ie it may be producing a list which is then consumed.

Most likely NZ *only* happens when the route is fully built, so it goes [] -> [a] -> [a, b] -> [a, b, c] -> [a, b, c, ff<?>] -> [a, b, ff<c>, ff<?>] -> [a, ff<b>, ff<c>, ff<?>] -> [ff<a>, ff<b>, ff<c>, ff<?>] -> return.

b805(01e5)     2a2cb7 LD HL,(&b72c)
b808(01e8)         23 INC HL
b809(01e9)       36ff LD (HL),&ff
b80b(01eb)         2b DEC HL
b80c(01ec)       36ff LD (HL),&ff
b80e(01ee)         2b DEC HL
b80f(01ef)         2b DEC HL
b810(01f0)         2b DEC HL
b811(01f1)     222cb7 LD (&b72c),HL
b814(01f4)         7e LD A,(HL)
b815(01f5)     3231b7 LD (&b731),A
b818(01f8)     218ab7 LD HL,&b78a
b81b(01fb)         35 DEC (HL)
b81c(01fc)       18bb JR d:-67

((b72c+1))=ff
((b72c+0))=ff

NOTE: The last datum here is deliberately retained

b72c-=3
(b731)=(b72c)
b78a--

Jump back (loop). In essence, this rewinds a step or two, depending on your perspective. In short, the *previous* step doesn't produce a valid result, so try another. This is a lot like right-hand/left-hand-search and is clearly a depth-first search of some kind. With memory being quite restricted, breadth-first isn't particularly viable.

b81e(01fe)         2b DEC HL
b81f(01ff)         7e LD A,(HL)

Void?

b820(0200) a:  3287b7 LD (&b787),A
b823(0203)       3e01 LD A,&01
b825(0205)     328bb7 LD (&b78b),A

(b787)=(b789/b731)
(b78b)=1

b828(0208)       060a LD B,&0a
b82a(020a)     21015b LD HL,&5b01
b82d(020d)   fd21f05c LD IY,&5cf0
b831(0211)     110300 LD DE,&0003
b834(0214)  e:     7e LD A,(HL)
b835(0215)     fd7700 LD (IY+0),A
b838(0218)       fd23 INC IY
b83a(021a)         19 ADD HL,DE
b83b(021b)       10f7 DJNZ e:-7

This copies 5b01, 5b04, 5b07, ... 5b1c to 5cf0, 5cf1, ... 5cf9

IOW, this shadows the identifier bytes from the first 10 entries in 5b01 to 5cf0.

b83d(021d)       18c1 JR b:-61

...and goes back to the optional return clause.

So this fundamentally writes to memory starting at (b72c) with three-byte data.


## Store (c912 + 2A) (word) in 5d3a

b83f(021f)         3d DEC A
b840(0220)         6f LD L,A
b841(0221)       2600 LD H,&00
b843(0223)         29 ADD HL,HL
b844(0224)     1114c9 LD DE,&c914
b847(0227)         19 ADD HL,DE
b848(0228)         5e LD E,(HL)
b849(0229)         23 INC HL
b84a(022a)         56 LD D,(HL)
b84b(022b)   ed533a5d LD   (&5d3a),DE
b84f(022f)         c9 RET

hl=c912 + 2A
5d3a=de=(hl=c912 + 2A)

Note: the practical starting point may be c914, ie calling with a=0 may be unintended.

## Find box for 5d3a-5d3b

b852(0232)     218cc8 LD HL,&c88c
b855(0235)     110500 LD DE,&0005
b858(0238) a:      e5 PUSH HL
b859(0239)     3a3a5d LD A,(&5d3a)
b85c(023c)         be CP (HL)
b85d(023d)       3813 JR C,b:21
b85f(023f)         23 INC HL
b860(0240)         be CP (HL)
b861(0241)       300f JR NC,b:17
b863(0243)         23 INC HL
b864(0244)     3a3b5d LD A,(&5d3b)
b867(0247)         be CP (HL)
b868(0248)       3808 JR C,b:10
b86a(024a)         23 INC HL
b86b(024b)         be CP (HL)
b86c(024c)       3004 JR NC,b:6
b86e(024e)         23 INC HL
b86f(024f)         7e LD A,(HL)
b870(0250)         e1 POP HL
b871(0251)         c9 RET
b872(0252) b:      e1 POP HL
b873(0253)         19 ADD HL,DE
b874(0254)         7e LD A,(HL)
b875(0255)       feff CP &ff
b877(0257)       20df JR NZ,a:-31
b879(0259)         af XOR A
b87a(025a)         c9 RET

This finds the first x [c88c + 5n] where (x) > (5d3a) >= (x+1) and (x+2) > (5d3b) >= (x+3), returning {a=(x+4), HL=x}; or the first x after c88c where (x) == ff, returning {a=00, hl=x}; IOW, if there's a match, its code is returned and HL is set to its beginning.

Sets: A, HL, flags

## Find box pair mapping

b87b(025b)            ; DATA - Box ID?
b87c(025c)            ; DATA - Box ID?
b87d(025d)     3a7bb8 LD A,(&b87b)
b880(0260)         4f LD C,A
b881(0261)     217cb8 LD HL,&b87c
b884(0264)         46 LD B,(HL)
b885(0265)         b8 CP B
b886(0266)       2002 JR NZ,a:4
b888(0268)         af XOR A
b889(0269)         c9 RET
b88a(026a) a:    3802 JR C,b:4
b88c(026c)         47 LD B,A
b88d(026d)         4e LD C,(HL)
b88e(026e) b:  2178c9 LD HL,&c978
b891(0271)     110000 LD DE,&0000
b894(0274)         05 DEC B
b895(0275)         0d DEC C
b896(0276) c:      19 ADD HL,DE
b897(0277)         13 INC DE
b898(0278)       10fc DJNZ c:-2
b89a(027a)         09 ADD HL,BC
b89b(027b)         7e LD A,(HL)
b89c(027c)         c9 RET

Sets A to a value with B-1 mapping to {0, 1, 3, 6, 10, 15...} and C mapping to itself. This uniquely identifies each B-C pair with a single value, because C is always less than the next initial B value. 0 if they are the same.

## Unknown

b89d(027d)            ; DATA - byte
b89e(027e)            ; DATA - byte
b89f(027f) x6: cd8567 CALL &6785
b8a2(0282)     cd2ab6 CALL &b62a
b8a5(0285)     21505c LD HL,&5c50
b8a8(0288)       0614 LD B,&14
b8aa(028a)   x5:   c5 PUSH BC
b8ab(028b)         e5 PUSH HL
b8ac(028c)         7e LD A,(HL)
b8ad(028d)       fe01 CP &01
b8af(028f)     c24dba JP NZ,x1:&ba4d
b8b2(0292)       3ea0 LD A,&a0
b8b4(0294)         90 SUB A,B
b8b5(0295)     32265d LD (&5d26),A
b8b8(0298)         23 INC HL
b8b9(0299)         5e LD E,(HL)
b8ba(029a)         23 INC HL
b8bb(029b)         56 LD D,(HL)
b8bc(029c)   ed53245d LD   (&5d24),DE
b8c0(02a0)     cd1261 CALL &6112
b8c3(02a3)     222f5d LD (&5d2f),HL
b8c6(02a6)     3a265d LD A,(&5d26)
b8c9(02a9)     cdc267 CALL &67c2
b8cc(02ac)   dd22335d LD (&5d33),IX
b8d0(02b0)     dd6e1a LD L,(IX+26)
b8d3(02b3)       2600 LD H,&00
b8d5(02b5)         29 ADD HL,HL
b8d6(02b6)         29 ADD HL,HL
b8d7(02b7)         29 ADD HL,HL
b8d8(02b8)     dd5e1a LD E,(IX+26)
b8db(02bb)       1600 LD D,&00
b8dd(02bd)         19 ADD HL,DE
b8de(02be)         19 ADD HL,DE
b8df(02bf)     1166c2 LD DE,&c266
b8e2(02c2)         19 ADD HL,DE
b8e3(02c3)     2286ba LD (&ba86),HL
b8e6(02c6)       3e01 LD A,&01
b8e8(02c8)     32365d LD (&5d36),A
b8eb(02cb)     cd2ab6 CALL &b62a
b8ee(02ce)     cdd771 CALL &71d7
b8f1(02d1)     cd2a6c CALL &6c2a
b8f4(02d4)         af XOR A
b8f5(02d5)     32375d LD (&5d37),A
b8f8(02d8)     32625d LD (&5d62),A
b8fb(02db)     dd7e24 LD A,(IX+36)
b8fe(02de)         b7 OR A
b8ff(02df)       2022 JR NZ,36:a
b901(02e1)     cd5d78 CALL &785d
b904(02e4)     dd7e23 LD A,(IX+35)
b907(02e7)     cddf67 CALL &67df
b90a(02ea)   dd22c25d LD (&5dc2),IX
b90e(02ee)     dd7e10 LD A,(IX+16)
b911(02f1)     cdab78 CALL &78ab
b914(02f4)   dd2a335d LD IX,(&5d33)
b918(02f8)       2009 JR NZ,11:a
b91a(02fa)     cde962 CALL &62e9
b91d(02fd)     cd019d CALL &9d01
b920(0300)     cd8b6a CALL &6a8b
b923(0303) a:  3a595d LD A,(&5d59)
b926(0306)         b7 OR A
b927(0307)     c4debd CALL NZ,&bdde
b92a(030a)     3a375d LD A,(&5d37)
b92d(030d)         b7 OR A
b92e(030e)     c24dba JP NZ,x1:&ba4d
b931(0311)     cd5cba CALL &ba5c
b934(0314)     c2ffb9 JP NZ,x2:&b9ff
b937(0317)   fd2a86ba LD IY,(&ba86)
b93b(031b)   fdcb085e BIT 3,(IY+8)
b93f(031f)     c2cfb9 JP NZ,x3:&b9cf
b942(0322) x4: cdd6bf CALL &bfd6
b945(0325)     3ad4bf LD A,(&bfd4)
b948(0328)         b7 OR A
b949(0329)     cacfb9 JP Z,x3:&b9cf
b94c(032c)       d68c SUB A,&8c
b94e(032e)         5f LD E,A
b94f(032f)       1600 LD D,&00
b951(0331)     213ab6 LD HL,&b63a
b954(0334)         19 ADD HL,DE
b955(0335)         7e LD A,(HL)
b956(0336)         b7 OR A
b957(0337)     cacfb9 JP Z,x3:&b9cf
b95a(033a)     3ad4bf LD A,(&bfd4)
b95d(033d)     cde4c0 CALL &c0e4
b960(0340)   ed533a5d LD   (&5d3a),DE
b964(0344)     cdf3c0 CALL &c0f3
b967(0347)     3a8f5d LD A,(&5d8f)
b96a(034a)         b7 OR A
b96b(034b)       2862 JR Z,x3:100
b96d(034d)     cd66bd CALL &bd66
b970(0350)     3288b7 LD (&b788),A
b973(0353)     3a8f5d LD A,(&5d8f)
b976(0356)         47 LD B,A
b977(0357)     210a5c LD HL,&5c0a
b97a(035a)       3eff LD A,&ff
b97c(035c)     329db8 LD (&b89d),A
b97f(035f)  b:     c5 PUSH BC
b980(0360)         e5 PUSH HL
b981(0361)         7e LD A,(HL)
b982(0362)     3289b7 LD (&b789),A
b985(0365)     cd8cb7 CALL &b78c
b988(0368)     3a8bb7 LD A,(&b78b)
b98b(036b)         b7 OR A
b98c(036c)       2812 JR Z,a:20
b98e(036e)     3a87b7 LD A,(&b787)
b991(0371)     219db8 LD HL,&b89d
b994(0374)         be CP (HL)
b995(0375)       3009 JR NC,a:11
b997(0377)     329db8 LD (&b89d),A
b99a(037a)     3a89b7 LD A,(&b789)
b99d(037d)     32afba LD (&baaf),A
b9a0(0380)  a:     e1 POP HL
b9a1(0381)         23 INC HL
b9a2(0382)         c1 POP BC
b9a3(0383)       10da DJNZ b:-36
b9a5(0385)         af XOR A
b9a6(0386)     329eb8 LD (&b89e),A
b9a9(0389)     cdb1ba CALL &bab1
b9ac(038c)     3a625d LD A,(&5d62)
b9af(038f)         b7 OR A
b9b0(0390)       204d JR NZ,x2:79
b9b2(0392)     3a375d LD A,(&5d37)
b9b5(0395)         b7 OR A
b9b6(0396)     c24dba JP NZ,x1:&ba4d
b9b9(0399)     3a595d LD A,(&5d59)
b9bc(039c)         b7 OR A
b9bd(039d)     c4debd CALL NZ,&bdde
b9c0(03a0)     3a375d LD A,(&5d37)
b9c3(03a3)         b7 OR A
b9c4(03a4)     c24dba JP NZ,x1:&ba4d
b9c7(03a7)     cd5cba CALL &ba5c
b9ca(03aa)       2033 JR NZ,x2:53
b9cc(03ac)     c342b9 JP x4:&b942
b9cf(03af)x3:fd2a86ba LD IY,(&ba86)
b9d3(03b3)         af XOR A
b9d4(03b4)     329eb8 LD (&b89e),A
b9d7(03b7)   fdcb0846 BIT 0,(IY+8)
b9db(03bb)       2014 JR NZ,a:22
b9dd(03bd)   fdcb084e BIT 1,(IY+8)
b9e1(03c1)       2006 JR NZ,b:8
b9e3(03c3)     3a14b7 LD A,(&b714)
b9e6(03c6)         b7 OR A
b9e7(03c7)       2808 JR Z,a:10
b9e9(03c9) b:  dd7e05 LD A,(IX+5)
b9ec(03cc)       cb3f SRL A
b9ee(03ce)     329eb8 LD (&b89e),A
b9f1(03d1) a:  cd88ba CALL &ba88
b9f4(03d4)     cd5cba CALL &ba5c
b9f7(03d7)       2006 JR NZ,x2:8
b9f9(03d9)     3a625d LD A,(&5d62)
b9fc(03dc)         b7 OR A
b9fd(03dd)       283d JR Z,e:63
b9ff(03df) x2: dd7e08 LD A,(IX+8)
ba02(03e2)         b7 OR A
ba03(03e3)       2848 JR Z,x1:74
ba05(03e5)     3a13b7 LD A,(&b713)
ba08(03e8)     cde4c0 CALL &c0e4
ba0b(03eb)   ed53daa5 LD   (&a5da),DE
ba0f(03ef)     2a245d LD HL,(&5d24)
ba12(03f2)     22dca5 LD (&a5dc),HL
ba15(03f5)     cde0a5 CALL &a5e0
ba18(03f8)     21005b LD HL,&5b00
ba1b(03fb)         5e LD E,(HL)
ba1c(03fc)         23 INC HL
ba1d(03fd)         56 LD D,(HL)
ba1e(03fe)   ed533a5d LD   (&5d3a),DE
ba22(0402)     cda6bc CALL &bca6
ba25(0405)         af XOR A
ba26(0406)     32625d LD (&5d62),A
ba29(0409)     3a595d LD A,(&5d59)
ba2c(040c)         b7 OR A
ba2d(040d)     ca42b9 JP Z,x4:&b942
ba30(0410)     cddebd CALL &bdde
ba33(0413)     3a375d LD A,(&5d37)
ba36(0416)         b7 OR A
ba37(0417)       2014 JR NZ,x1:22
ba39(0419)     c342b9 JP x4:&b942
ba3c(041c)  e: 3a375d LD A,(&5d37)
ba3f(041f)         b7 OR A
ba40(0420)       200b JR NZ,x1:13
ba42(0422)     3a595d LD A,(&5d59)
ba45(0425)         b7 OR A
ba46(0426)       2805 JR Z,x1:7
ba48(0428)     cddebd CALL &bdde
ba4b(042b)       18a4 JR a:-90
ba4d(042d) x1:     e1 POP HL
ba4e(042e)     110400 LD DE,&0004
ba51(0431)         19 ADD HL,DE
ba52(0432)         c1 POP BC
ba53(0433)         05 DEC B
ba54(0434)     c2aab8 JP NZ,x5:&b8aa
ba57(0437)         af XOR A
ba58(0438)     32365d LD (&5d36),A
ba5b(043b)         c9 RET

???
Init 11x11 grid
20 times:
    if (5c50 + 4n) != 1: jump x1
    (5d26) = 160-20
    (5d24)=de=(5c50 + 4n + 1)
    ???
    (5d2f)=HL
    a=(5d26)
    ???
    (5d33)=IX
    (ba86)=c266 + (ix+26) * 10 <word>
    (5d36)=A=1
    Init 11x11 grid
    ???
    ???
    (5d37)=(5d62)=0
    if (ix+36) == 0:
        ???
        a=(ix+35)
        ???
        (5dc2)=ix
        a=(ix+16)
        ???
        ix=(5d33)
        if Z:
            ???
            ???
            ???
    if (5d59)->NZ: ?Unknown? bdde
    if (5d37)!=0: jump x1
    if there's an entry in 5b99 for which 8x<x> is nonzero: jump x2 (b713 set)
    iy=(ba86)
    if (iy+8)->3 != 0: jump x3

    loop:
        (Not completely clear, but it apparently writes back to bfd4/bfd5 a max-val
        from 5b00<2>. bfd5 is the actual max so probably the least interesting value.)
        if {
            (bfd4)!=0 &&
            (b63a+(bdf4)-8c) != 0 &&
            [
                Store the 8c memory base for (bfd4) -> (5d3a);
                Fill 5c0a from 5d3a via c914/c21d -> b78a
            ]
            (5d8f)!=0
        } :
            Find max(?) in c914 -> (b788)
            (b89d)=A=ff
            (5d8f) times:
                (b789)=(5c0a+n)
                Build route(?)
                if (b78b)!=0 && (b89d) > (b787):
                    (b89d)=(b787)
                    (baaf)=(b789)
            (b89e)=0
            ?Unknown bab1
            if (5d62) == 0:
                if (5d37) != 0: jump x1
                if (5d59) != 0: call bdde (unknown)
                if (5d37) != 0: jump x1
                if there's not an entry in 5b99 for which 8x<x> is nonzero: `continue`
        else:
            iy=(ba86)
            (b89e)=0
            if (iy+8)->0 == 0 || (iy+8)->1 != 0 && (b714) != 0:
                (b89e) = (ix+5) / 2
            a:
            Find an entry in distance-list ((ba86)) for which bab1->bab0 is zero
            if there's an entry in 5b99 for which 8x<x> is nonzero && (5d62) == 0:
                `break`
        x2:
        if (ix+8) == 0: jump x1
        a=(b713)
        Find 8c memory base -> (a5da)
        (a5dc) = (5d24) [word]
        ?Unknown? a5e0
        Rotate {IX} to face (5b00) -> Z
        (5d62)=0
        if (5d59) != 0:
            ?Unknown? bdde
            if (5d37) != 0: jump x1
    if (5d37) == 0 && (5d59) != 0:
        ?Unknown? bdde
        jump a
(5d36)=0

This is a hardcore spaghetti mess, suggesting that it warrants a lot of
attention and optimisation.

## Find the first entry in 5b99 for which 8c<x> is nonzero -> b713

ba5c(043c)     21995b LD HL,&5b99
ba5f(043f)  b:     7e LD A,(HL)
ba60(0440)       feff CP &ff
ba62(0442)         c8 RET Z
ba63(0443)         e5 PUSH HL
ba64(0444)         f5 PUSH AF
ba65(0445)       d68c SUB A,&8c
ba67(0447)         5f LD E,A
ba68(0448)       1600 LD D,&00
ba6a(044a)     213ab6 LD HL,&b63a
ba6d(044d)         19 ADD HL,DE
ba6e(044e)         7e LD A,(HL)
ba6f(044f)         b7 OR A
ba70(0450)       200b JR NZ,a:13
ba72(0452)         f1 POP AF
ba73(0453)         e1 POP HL
ba74(0454)         23 INC HL
ba75(0455)         7e LD A,(HL)
ba76(0456)       feff CP &ff
ba78(0458)         c8 RET Z
ba79(0459)         23 INC HL
ba7a(045a)         23 INC HL
ba7b(045b)       18e2 JR b:-28
ba7d(045d) a:      f1 POP AF
ba7e(045e)         e1 POP HL
ba7f(045f)     3213b7 LD (&b713),A
ba82(0462)       3e01 LD A,&01
ba84(0464)         b7 OR A
ba85(0465)         c9 RET

Loop:

if (5b99+3n)==ff: return(Z)
if (b63a+(5b99+3n)-8c) != 0: b713=(b63a+(5b99+3n)-8c); return(NZ)
else if (5b99+3n+1) == ff: return(Z)
else `continue`

So this terminates at ff---- or --ff--. Only the first two bytes are considered at all - and the first needs to be an offset mapping to a nonzero value.

## Find an entry in distance-list ((ba86)) for which bab1->bab0 is zero

ba86(0466)            ; DATA - IN, memory address
ba88(0468)  b:     af XOR A
ba89(0469)     32d4bf LD (&bfd4),A
ba8c(046c)     2a86ba LD HL,(&ba86)
ba8f(046f)         5e LD E,(HL)
ba90(0470)       1600 LD D,&00
ba92(0472)         19 ADD HL,DE
ba93(0473)         7e LD A,(HL)
ba94(0474)     32afba LD (&baaf),A
ba97(0477)         b7 OR A
ba98(0478)       2007 JR NZ,a:9
ba9a(047a)     2a86ba LD HL,(&ba86)
ba9d(047d)       3601 LD (HL),&01
ba9f(047f)       18e7 JR b:-23
baa1(0481) a:  cdb1ba CALL &bab1
baa4(0484)     3ab0ba LD A,(&bab0)
baa7(0487)         b7 OR A
baa8(0488)         c8 RET Z
baa9(0489)     2a86ba LD HL,(&ba86)
baac(048c)         34 INC (HL)
baad(048d)       18d9 JR b:-37

loop:
    (bfd4) = 0
    (baaf) = (((ba86)) + n + (((ba86)) + n))

    if (((ba86)) + n + (((ba86)) + n)) == 0:
        // Reset to ((ba86)) + n == 1
    else:
        ?Unknown? bab1
        if (bab0) == 0: return

Ugh so much dereferencing.

The value in (ba86) never changes, but the value in ((ba86)) - let's say (ba86')
- is incremented or reset to 1. This refers to a distance after ba86' which
contains a value of some kind. IOW, these look a lot like "cheap strings", as
<distance>, <byte1>, <byte2>, ... <null>. It just starts where it is, and runs
through until bab1->bab0(x) is zero.

## Unknown

baaf(048f)            ; DATA - IN, word
bab0(0490)            ; DATA - OUT, byte
bab1(0491)         af XOR A
bab2(0492)     32b0ba LD (&bab0),A
bab5(0495)     2a245d LD HL,(&5d24)
bab8(0498)     cd41bd CALL &bd41
babb(049b)     21afba LD HL,&baaf
babe(049e)         be CP (HL)
babf(049f)       200c JR NZ,a:14
bac1(04a1)       3e01 LD A,&01
bac3(04a3)     32b0ba LD (&bab0),A
bac6(04a6)     3ad4bf LD A,(&bfd4)
bac9(04a9)         b7 OR A
baca(04aa)       205e JR NZ,d:96
bacc(04ac)         c9 RET
bacd(04ad) a:  21f05c LD HL,&5cf0
bad0(04b0)     222cb7 LD (&b72c),HL
bad3(04b3)     3aafba LD A,(&baaf)
bad6(04b6)     3289b7 LD (&b789),A
bad9(04b9)     cd66bd CALL &bd66
badc(04bc)     3288b7 LD (&b788),A
badf(04bf)     2189b7 LD HL,&b789
bae2(04c2)         be CP (HL)
bae3(04c3)       2009 JR NZ,b:11
bae5(04c5)     3a88b7 LD A,(&b788)
bae8(04c8)     21f05c LD HL,&5cf0
baeb(04cb)         77 LD (HL),A
baec(04cc)       1827 JR c:41
baee(04ce) b:  cd8cb7 CALL &b78c
baf1(04d1)     21f05c LD HL,&5cf0
baf4(04d4)     222cb7 LD (&b72c),HL
baf7(04d7)     2a245d LD HL,(&5d24)
bafa(04da)     22475d LD (&5d47),HL
bafd(04dd)     2a2cb7 LD HL,(&b72c)
bb00(04e0)         23 INC HL
bb01(04e1)         7e LD A,(HL)
bb02(04e2)     cd3fb8 CALL &b83f
bb05(04e5)   ed53495d LD   (&5d49),DE
bb09(04e9)     cd0172 CALL &7201
bb0c(04ec)       2007 JR NZ,c:9
bb0e(04ee)     2a2cb7 LD HL,(&b72c)
bb11(04f1)         23 INC HL
bb12(04f2)     222cb7 LD (&b72c),HL
bb15(04f5) c:  2a2cb7 LD HL,(&b72c)
bb18(04f8)         7e LD A,(HL)
bb19(04f9)     3231b7 LD (&b731),A
bb1c(04fc)         23 INC HL
bb1d(04fd)     222cb7 LD (&b72c),HL
bb20(0500)     cd3fb8 CALL &b83f
bb23(0503)   ed53daa5 LD   (&a5da),DE
bb27(0507)     cd92bc CALL &bc92
bb2a(050a) d:  3ab0ba LD A,(&bab0)
bb2d(050d)         b7 OR A
bb2e(050e)       2812 JR Z,e:20
bb30(0510)     3ad4bf LD A,(&bfd4)
bb33(0513)         b7 OR A
bb34(0514)       280c JR Z,e:14
bb36(0516)     3ad4bf LD A,(&bfd4)
bb39(0519)     cde4c0 CALL &c0e4
bb3c(051c)   ed53daa5 LD   (&a5da),DE
bb40(0520)       1820 JR f:34
bb42(0522) e:  2a245d LD HL,(&5d24)
bb45(0525)     cd41bd CALL &bd41
bb48(0528)     21afba LD HL,&baaf
bb4b(052b)         be CP (HL)
bb4c(052c)       200e JR NZ,g:16
bb4e(052e)       3e01 LD A,&01
bb50(0530)     32b0ba LD (&bab0),A
bb53(0533)     3ad4bf LD A,(&bfd4)
bb56(0536)         b7 OR A
bb57(0537)     ca1bbc JP Z,x9:&bc1b
bb5a(053a)       18ce JR d:-48
bb5c(053c) g:  2131b7 LD HL,&b731
bb5f(053f)         be CP (HL)
bb60(0540)       28b3 JR Z,c:-75
bb62(0542) f:  2a245d LD HL,(&5d24)
bb65(0545)     22dca5 LD (&a5dc),HL
bb68(0548)     cde0a5 CALL &a5e0
bb6b(054b)     21005b LD HL,&5b00
bb6e(054e)     22fb5d LD (&5dfb),HL
bb71(0551)       0608 LD B,&08
bb73(0553)  h:     c5 PUSH BC
bb74(0554)     2afb5d LD HL,(&5dfb)
bb77(0557)         5e LD E,(HL)
bb78(0558)         23 INC HL
bb79(0559)         56 LD D,(HL)
bb7a(055a)         23 INC HL
bb7b(055b)         23 INC HL
bb7c(055c)     22fb5d LD (&5dfb),HL
bb7f(055f)       3eff LD A,&ff
bb81(0561)         bb CP E
bb82(0562)       2829 JR Z,i:43
bb84(0564)   ed533a5d LD   (&5d3a),DE
bb88(0568)     cd72bc CALL &bc72
bb8b(056b)       2820 JR Z,j:34 [l]
bb8d(056d)         af XOR A
bb8e(056e)     32385d LD (&5d38),A
bb91(0571)     cdbf6e CALL &6ebf
bb94(0574)     3a295d LD A,(&5d29)
bb97(0577)       fe02 CP &02
bb99(0579)       285f JR Z,k:97
bb9b(057b)       fe05 CP &05
bb9d(057d) j:    285e JR Z,l:96
bb9f(057f)     dd7e16 LD A,(IX+22)
bba2(0582)       fe8c CP &8c
bba4(0584)       3007 JR NC,i:9
bba6(0586)     3a295d LD A,(&5d29)
bba9(0589)       fe01 CP &01
bbab(058b)       280a JR Z,m:12
bbad(058d)  i:     c1 POP BC
bbae(058e)       10c3 DJNZ h:-59
bbb0(0590)     cd169a CALL &9a16
bbb3(0593)     c24270 JP NZ,&7042
bbb6(0596)         c9 RET
bbb7(0597) m:  2a3e5d LD HL,(&5d3e)
bbba(059a)         7e LD A,(HL)
bbbb(059b)     cdf767 CALL &67f7
bbbe(059e)     fd7e08 LD A,(IY+8)
bbc1(05a1)       fe01 CP &01
bbc3(05a3)       2012 JR NZ,n:20
bbc5(05a5)         c1 POP BC
bbc6(05a6)       fde5 PUSH IY
bbc8(05a8)     cda6bc CALL &bca6
bbcb(05ab)       fde1 POP IY
bbcd(05ad)       284c JR Z,x9:78
bbcf(05af)     cdf779 CALL &79f7
bbd2(05b2)       3847 JR C,x9:73
bbd4(05b4)     c32abb JP d:&bb2a
bbd7(05b7) n:  2a3e5d LD HL,(&5d3e)
bbda(05ba)         7e LD A,(HL)
bbdb(05bb)       0608 LD B,&08
bbdd(05bd)     215ec2 LD HL,&c25e
bbe0(05c0)  p:     be CP (HL)
bbe1(05c1)       2805 JR Z,o:7
bbe3(05c3)         23 INC HL
bbe4(05c4)       10fa DJNZ p:-4
bbe6(05c6)       18c5 JR i:-57
bbe8(05c8)  o:     c1 POP BC
bbe9(05c9)     cda6bc CALL &bca6
bbec(05cc)       282d JR Z,x9:47
bbee(05ce)     cd0b7f CALL &7f0b
bbf1(05d1)     3a375d LD A,(&5d37)
bbf4(05d4)         b7 OR A
bbf5(05d5)       2024 JR NZ,x9:38
bbf7(05d7)     c32abb JP d:&bb2a
bbfa(05da) k:      c1 POP BC
bbfb(05db)       181e JR x9:32
bbfd(05dd) l:      c1 POP BC
bbfe(05de)     cd27bc CALL &bc27
bc01(05e1)     3a595d LD A,(&5d59)
bc04(05e4)         b7 OR A
bc05(05e5)       2019 JR NZ,m:27
bc07(05e7)     3a625d LD A,(&5d62)
bc0a(05ea)         b7 OR A
bc0b(05eb)       2013 JR NZ,m:21
bc0d(05ed)     cdb3bd CALL &bdb3
bc10(05f0)       2809 JR Z,x9:11
bc12(05f2)     3a375d LD A,(&5d37)
bc15(05f5)         b7 OR A
bc16(05f6)       2008 JR NZ,m:10
bc18(05f8)     c32abb JP d:&bb2a
bc1b(05fb)  x9:  3e01 LD A,&01
bc1d(05fd)     32375d LD (&5d37),A
bc20(0600) m:  cd169a CALL &9a16
bc23(0603)     c24270 JP NZ,&7042
bc26(0606)         c9 RET

(bab0)=0
if Find (5d24) in c914 == (baaf):
    bab0 = 1
    if (bfd4)==0: `return`
    else: jump d
else:
    (b72c)=5cf0
    (b789)=(baaf)
    Find max(?) in c914 -> b788
    if (b788) == (b789):
        (5cf0) = (b788)
    else:
        Build route(?)
        (b72c)=5cf0
        (5d47)=(5d24) [word]
        Store (c912 + 2 * ((b72c)+1)) (word) in 5d3a
        (5d49)=DE
        if ???->Z: (b72c)++
loop c:
    (b731)=((b72c))
    (b72c)++
    Store (c912 + 2*(b731)) (word) in 5d3a
    (a5da)=(5d3a)
    Bitfill 5c0a(50)
    loop d:
        if (bab0) != 0 && (bfd4) != 0:
            a=(bfd4)
            Set (a5da)=8c memory base
        else:
            Find (5d24) in c914 -> A
            if (baaf) == A:
                (bab0) = 1
                if (bfd4) == 0: &return(true)
                else: `continue`
            else if (b731) == A: `continue c`
        (a5dc)=(5d24) [word]
        ???
        (5dfb)=5b00
        8 times:
            if byte((5dfb)+3n)!=ff:
                if word((5dfb)+3n) is in (5c0a)<25t>:
                    Overwatch turn-and-fire?
                    if (5d59) != 0 || (5d62) != 0 || {bdb3->NZ && (5d37) != 0}:
                        &return(false)
                    else if bdb3->NZ && (5d37) != 0:
                        `continue`
                    else:
                        &return(true)
                else:
                    (5d38)=0
                    ???
                    if (5d29) == 2: &return(true)
                    else if (5d29) == 5:
                        Overwatch turn-and-fire?
                        if (5d59) != 0 || (5d62) != 0 || {bdb3->NZ && (5d37) != 0}:
                            &return(false)
                        else if bdb3->NZ && (5d37) != 0:
                            `continue`
                        else:
                            &return(true)
                    else if (ix+22) == 8c: `continue`
                    else if (5d29) == 1:
                        a=((5d3e))
                        ???
                        if (iy+8) != 1:
                            if Rotate {IX} to face (5d3a) -> Z || 79f7 -> C:
                                &return(true)
                        else:
                            8 times:
                                if (c25e) == ((5d3e+n)):
                                    if {
                                        Rotate {IX} to face (5d3a) -> Z ||
                                        ???->(5d37) != 0
                                    }:
                                        &return(true)
                    else if last loop:
                        &return(false)

&return(set) {
    if set: (5d37) = 1
    if 9a16->NZ: return via 7042
    else return
}

## Overwatch turn-and-fire?

bc27(0607)     cda6bc CALL &bca6
bc2a(060a)         c8 RET Z
bc2b(060b)     dd7e06 LD A,(IX+6)
bc2e(060e)     219eb8 LD HL,&b89e
bc31(0611)         96 SUB A,(HL)
bc32(0612)       3806 JR C,a:8
bc34(0614)     21285d LD HL,&5d28
bc37(0617)         96 SUB A,(HL)
bc38(0618)       3006 JR NC,b:8
bc3a(061a) a:    3e01 LD A,&01
bc3c(061c)     32375d LD (&5d37),A
bc3f(061f)         c9 RET
bc40(0620) b:fd2a86ba LD IY,(&ba86)
bc44(0624)   fdcb0856 BIT 2,(IY+8)
bc48(0628)       2006 JR NZ,c:8
bc4a(062a)     3ad4bf LD A,(&bfd4)
bc4d(062d)         b7 OR A
bc4e(062e)       280b JR Z,d:13
bc50(0630) c:  cd85c1 CALL &c185
bc53(0633)       2806 JR Z,d:8
bc55(0635)       3e01 LD A,&01
bc57(0637)     32375d LD (&5d37),A
bc5a(063a)         c9 RET
bc5b(063b) d:  cd896f CALL &6f89
bc5e(063e)     2a70bc LD HL,(&bc70)
bc61(0641)   ed5b245d LD   DE,(&5d24)
bc65(0645)         73 LD (HL),E
bc66(0646)         23 INC HL
bc67(0647)         72 LD (HL),D
bc68(0648)         23 INC HL
bc69(0649)     2270bc LD (&bc70),HL
bc6c(064c)     cdbc6b CALL &6bbc
bc6f(064f)         c9 RET
bc70(0650)            ; DATA - INOUT, memory address

if Rotate {IX} to face (5d3a) -> Z: return
if (ix+6) not in range{(b89e), (b89e) + (5d28) - 1}: return(5d37=1)
if ((ba86)+8)->2 != 0 && (bfd4) != 0 && Something something overwatch?->Z:
    return(5d37=1)
???
((bc70))=(5d24)
(bc70)+=2
???
...and return.

The use of ix+6 is a bit odd because elsewhere that looked like the overwatch cost. This could be an overwatch turn-and-fire?

## Is (5d3a)<w> in (5c0a)<25t>

bc72(0652)     210a5c LD HL,&5c0a
bc75(0655)       0619 LD B,&19
bc77(0657)   d:    7e LD A,(HL)
bc78(0658)       feff CP &ff
bc7a(065a)       2812 JR Z,a:20
bc7c(065c)     3a3a5d LD A,(&5d3a)
bc7f(065f)         be CP (HL)
bc80(0660)       2008 JR NZ,b:10
bc82(0662)         23 INC HL
bc83(0663)     3a3b5d LD A,(&5d3b)
bc86(0666)         be CP (HL)
bc87(0667)       2002 JR NZ,c:4
bc89(0669)         c9 RET
bc8a(066a)  b:     23 INC HL
bc8b(066b)  c:     23 INC HL
bc8c(066c)       10e9 DJNZ d:-21
bc8e(066e)  a:   3e01 LD A,&01
bc90(0670)         b7 OR A
bc91(0671)         c9 RET

So this returns (Z) if (5d3a)<w> is in (5c0a)<25t> before it hits an ff first byte

## Bitfill 5c0a(50)

bc92(0672)     210a5c LD HL,&5c0a
bc95(0675)     2270bc LD (&bc70),HL

(bc70)=5c0a

bc98(0678)     110b5c LD DE,&5c0b

DE=5c0b

bc9b(067b)       36ff LD (HL),&ff
bc9d(067d)     013100 LD BC,&0031
bca0(0680)       edb0 LDIR
bca2(0682)         c9 RET

Put 50 (0x32) ffs in 5c0a - 5c3c; also (bc70)=5c0a

## Rotate {IX} to face (5d3a) -> Z

In: ix, 5d3a, ix+33

bca3(0683)            ; DATA - byte, LOCAL; data from IX+33; finite field in the range 0-7.
bca4(0684)            ; DATA - byte, LOCAL; second loop counter?
bca5(0685)            ; DATA - byte, LOCAL; loop counter?
bca6(0686)     2a3a5d LD HL,(&5d3a)
bca9(0689)     22dca5 LD (&a5dc),HL

(a5dc) = (5d3a) [word]

bcac(068c)     dd7e21 LD A,(IX+33)
bcaf(068f)     32a3bc LD (&bca3),A
bcb2(0692)         af XOR A
bcb3(0693)     32a5bc LD (&bca5),A
bcb6(0696) b:  3aa3bc LD A,(&bca3)
bcb9(0699)     cd746e CALL &6e74
bcbc(069c)     2adca5 LD HL,(&a5dc)
bcbf(069f)   ed5b3a5d LD   DE,(&5d3a)
bcc3(06a3)         a7 AND A
bcc4(06a4)       ed52 SBC  HL,DE
bcc6(06a6)       2815 JR Z,a:23
bcc8(06a8)     21a5bc LD HL,&bca5
bccb(06ab)         34 INC (HL)
bccc(06ac)     3aa3bc LD A,(&bca3)
bccf(06af)         3c INC A
bcd0(06b0)     32a3bc LD (&bca3),A
bcd3(06b3)       fe08 CP &08
bcd5(06b5)       38df JR C,b:-31
bcd7(06b7)         af XOR A
bcd8(06b8)     32a3bc LD (&bca3),A
bcdb(06bb)       18d9 JR b:-37

Find x such that 6e74((ix+33)+x % 8) implies (a5dc)'==(5d3a)' -> (bca5)

bcdd(06bd)  a:     af XOR A
bcde(06be)     32a4bc LD (&bca4),A
bce1(06c1)     dd7e21 LD A,(IX+33)
bce4(06c4)     32a3bc LD (&bca3),A
bce7(06c7) d:  3aa3bc LD A,(&bca3)
bcea(06ca)     cd746e CALL &6e74
bced(06cd)     2adca5 LD HL,(&a5dc)
bcf0(06d0)   ed5b3a5d LD   DE,(&5d3a)
bcf4(06d4)         a7 AND A
bcf5(06d5)       ed52 SBC  HL,DE
bcf7(06d7)       2816 JR Z,c:24
bcf9(06d9)     21a4bc LD HL,&bca4
bcfc(06dc)         34 INC (HL)
bcfd(06dd)     3aa3bc LD A,(&bca3)
bd00(06e0)         3d DEC A
bd01(06e1)     32a3bc LD (&bca3),A
bd04(06e4)       feff CP &ff
bd06(06e6)       20df JR NZ,d:-31
bd08(06e8)       3e07 LD A,&07
bd0a(06ea)     32a3bc LD (&bca3),A
bd0d(06ed)       18d8 JR d:-38

Find x such that 6e74((ix+33)-x % 8) implies (a5dc)'==(5d3a)' -> (bca4)

bd0f(06ef) c:  3aa5bc LD A,(&bca5)
bd12(06f2)         b7 OR A
bd13(06f3)       2826 JR Z,h:40
bd15(06f5)     21a4bc LD HL,&bca4
bd18(06f8)         be CP (HL)
bd19(06f9)       3811 JR C,f:19
bd1b(06fb)     3aa4bc LD A,(&bca4)
bd1e(06fe)         47 LD B,A
bd1f(06ff)  g:     c5 PUSH BC
bd20(0700)     cdde6d CALL &6dde
bd23(0703)         c1 POP BC
bd24(0704)     cdb3bd CALL &bdb3
bd27(0707)         c8 RET Z
bd28(0708)       10f5 DJNZ g:-9
bd2a(070a)       180f JR h:17
bd2c(070c) f:  3aa5bc LD A,(&bca5)
bd2f(070f)         47 LD B,A
bd30(0710)   i:    c5 PUSH BC
bd31(0711)     cdaf6d CALL &6daf
bd34(0714)         c1 POP BC
bd35(0715)     cdb3bd CALL &bdb3
bd38(0718)         c8 RET Z
bd39(0719)       10f5 DJNZ i:-9
bd3b(071b)  h:   3e01 LD A,&01
bd3d(071d)         b7 OR A
bd3e(071e)         c9 RET

if bca5==0: return(Z)
(min<bca4,bca5>) times:
    if {6dde; bdb3}->Z: return(Z)

Otherwise: return(NZ)

## Find HL in c914

bd3f(071f)            ; DATA - LOCAL, word- from hl
bd40(0720)            ; DATA - LOCAL, word+
bd41(0721)     223fbd LD (&bd3f),HL
bd44(0724)     2114c9 LD HL,&c914
bd47(0727)     3a1dc2 LD A,(&c21d)
bd4a(072a)         47 LD B,A
bd4b(072b) c:  3a3fbd LD A,(&bd3f)
bd4e(072e)         be CP (HL)
bd4f(072f)       200d JR NZ,a:15
bd51(0731)         23 INC HL
bd52(0732)     3a40bd LD A,(&bd40)
bd55(0735)         be CP (HL)
bd56(0736)       2007 JR NZ,b:9
bd58(0738)     3a1dc2 LD A,(&c21d)
bd5b(073b)         3c INC A
bd5c(073c)         90 SUB A,B
bd5d(073d)         c9 RET
bd5e(073e)  a:     23 INC HL
bd5f(073f)  b:     23 INC HL
bd60(0740)       10e9 DJNZ c:-21
bd62(0742)         af XOR A
bd63(0743)         c9 RET

Starting at c914, jumping by 2 up to (c21d) times: if hl'<w> == hl<w>, return with a=(c21d)-1-b

Otherwise return (a=0)

IOW, this finds hl in c914; if it takes over c21d steps, a=0; otherwise a is the number of steps left.

## Find max(?) in c914

bd64(0744)            ; DATA - LOCAL, byte - words after this
bd65(0745)            ; DATA - LOCAL, byte
bd66(0746)     2a245d LD HL,(&5d24)
bd69(0749)     cd41bd CALL &bd41
bd6c(074c)         b7 OR A
bd6d(074d)         c0 RET NZ

Find (5d24) in c914 -> A
Return if A!=0, IOW if (5d24) was found in c914.

bd6e(074e)     2a245d LD HL,(&5d24)
bd71(0751)     224ba5 LD (&a54b),HL
bd74(0754)     22475d LD (&5d47),HL
bd77(0757)       3eff LD A,&ff
bd79(0759)     3265bd LD (&bd65),A
bd7c(075c)     3a1dc2 LD A,(&c21d)
bd7f(075f)         47 LD B,A
bd80(0760)     2114c9 LD HL,&c914

(5d47)=(a54b)=(5d24) [word]
bd65=ff
a=b=(c21d)
hl=c914

bd83(0763)   b:    e5 PUSH HL
bd84(0764)         c5 PUSH BC
bd85(0765)         5e LD E,(HL)
bd86(0766)         23 INC HL
bd87(0767)         56 LD D,(HL)
bd88(0768)   ed534da5 LD   (&a54d),DE
bd8c(076c)   ed53495d LD   (&5d49),DE
bd90(0770)     cd0172 CALL &7201
bd93(0773)         c1 POP BC
bd94(0774)       2014 JR NZ,a:22
bd96(0776)     cd50a5 CALL &a550
bd99(0779)     2165bd LD HL,&bd65
bd9c(077c)         be CP (HL)
bd9d(077d)       300b JR NC,a:13
bd9f(077f)     3265bd LD (&bd65),A
bda2(0782)     3a1dc2 LD A,(&c21d)
bda5(0785)         3c INC A
bda6(0786)         90 SUB A,B
bda7(0787)     3264bd LD (&bd64),A
bdaa(078a) a:      e1 POP HL
bdab(078b)         23 INC HL
bdac(078c)         23 INC HL
bdad(078d)       10d4 DJNZ b:-42

Loop:
(a54d)=(5d49)=(c914+2n)
??
if nonzero: `continue`
??
if (bd65) > a: (bd65)=a; (bd64)=(c21d)+1-b

bdaf(078f)     3a64bd LD A,(&bd64)
bdb2(0792)         c9 RET

Return with a=number of words after the highest A<?> found

This probably finds the closest value to (5d47)/(a54b)/(5d24)

## Unknown

bdb3(0793)     dd7e06 LD A,(IX+6)
bdb6(0796)         b7 OR A
bdb7(0797)       2814 JR Z,a:22
bdb9(0799)     219eb8 LD HL,&b89e
bdbc(079c)         96 SUB A,(HL)
bdbd(079d)       280e JR Z,a:16
bdbf(079f)     dd7e08 LD A,(IX+8)
bdc2(07a2)         b7 OR A
bdc3(07a3)       2808 JR Z,a:10
bdc5(07a5)     3a595d LD A,(&5d59)
bdc8(07a8)         b7 OR A
bdc9(07a9)       2009 JR NZ,b:11
bdcb(07ab)         3c INC A
bdcc(07ac)         c9 RET
bdcd(07ad)  a:   3e01 LD A,&01
bdcf(07af)     32375d LD (&5d37),A
bdd2(07b2)         af XOR A
bdd3(07b3)         c9 RET
bdd4(07b4)  b:   3e01 LD A,&01
bdd6(07b6)     3214b7 LD (&b714),A
bdd9(07b9)         af XOR A
bdda(07ba)         c9 RET

So this doesn't do a whole lot.

if (ix+6) == 0 || (ix+6) == (b89e) || (ix+8) == 0: (5d37)=1; a=0; return
else if (5d59) == 0: a=1; return
else: (b714)=1; a=0; return

In: ix(ix+6, ix+8); 5d59; b89e

Out: a(0|1); flags; 5d37; b714

ix+8 is constitution (if on the unit list), which may mean the unit is dead.

## Unknown

bddb(07bb)            ; DATA - LOCAL, word
bddd(07bd)            ; DATA - LOCAL, byte
bdde(07be)     cdd771 CALL &71d7
bde1(07c1)       3e01 LD A,&01
bde3(07c3)     3214b7 LD (&b714),A
bde6(07c6)       0608 LD B,&08
bde8(07c8)     2a245d LD HL,(&5d24)
bdeb(07cb)     22dca5 LD (&a5dc),HL
bdee(07ce)     21caa5 LD HL,&a5ca
bdf1(07d1)     22dea5 LD (&a5de),HL
bdf4(07d4)     21005b LD HL,&5b00
bdf7(07d7)     22fb5d LD (&5dfb),HL
bdfa(07da)  c:     c5 PUSH BC
bdfb(07db)     2adca5 LD HL,(&a5dc)
bdfe(07de)     22245d LD (&5d24),HL
be01(07e1)     2adea5 LD HL,(&a5de)
be04(07e4)     3a245d LD A,(&5d24)
be07(07e7)         86 ADD A,(HL)
be08(07e8)     323a5d LD (&5d3a),A
be0b(07eb)         23 INC HL
be0c(07ec)     3a255d LD A,(&5d25)
be0f(07ef)         86 ADD A,(HL)
be10(07f0)     323b5d LD (&5d3b),A
be13(07f3)         23 INC HL
be14(07f4)     22dea5 LD (&a5de),HL
be17(07f7)   ed5b3a5d LD   DE,(&5d3a)
be1b(07fb)   ed53245d LD   (&5d24),DE
be1f(07ff)     2afb5d LD HL,(&5dfb)
be22(0802)         73 LD (HL),E
be23(0803)         23 INC HL
be24(0804)         72 LD (HL),D
be25(0805)         23 INC HL
be26(0806)     22fb5d LD (&5dfb),HL
be29(0809)     cd1261 CALL &6112
be2c(080c)     223e5d LD (&5d3e),HL
be2f(080f)     cd6a72 CALL &726a
be32(0812)     3a975b LD A,(&5b97)
be35(0815)       feff CP &ff
be37(0817)       2022 JR NZ,a:36
be39(0819)     2a3e5d LD HL,(&5d3e)
be3c(081c)         7e LD A,(HL)
be3d(081d)       fe8c CP &8c
be3f(081f)       301a JR NC,a:28
be41(0821)     cd4a6b CALL &6b4a
be44(0824)     cdf767 CALL &67f7
be47(0827)     dd5e04 LD E,(IX+4)
be4a(082a)       1600 LD D,&00
be4c(082c)       fd19 ADD IY,DE
be4e(082e)     fd7e00 LD A,(IY+0)
be51(0831)       feff CP &ff
be53(0833)       2806 JR Z,a:8
be55(0835)     2afb5d LD HL,(&5dfb)
be58(0838)         77 LD (HL),A
be59(0839)       1805 JR b:7
be5b(083b) a:  2afb5d LD HL,(&5dfb)
be5e(083e)       36ff LD (HL),&ff
be60(0840) b:      23 INC HL
be61(0841)     22fb5d LD (&5dfb),HL
be64(0844)         c1 POP BC
be65(0845)       1093 DJNZ c:-107
be67(0847)       3e07 LD A,&07
be69(0849)     32fd5d LD (&5dfd),A
be6c(084c)     21005b LD HL,&5b00
be6f(084f)     2278a5 LD (&a578),HL
be72(0852)     cd7aa5 CALL &a57a
be75(0855)     2a005b LD HL,(&5b00)
be78(0858)     22dbbd LD (&bddb),HL
be7b(085b)     3a025b LD A,(&5b02)
be7e(085e)         3c INC A
be7f(085f)     32ddbd LD (&bddd),A
be82(0862)     2adca5 LD HL,(&a5dc)
be85(0865)     22245d LD (&5d24),HL
be88(0868)     cd24b6 CALL &b624
be8b(086b)   dd2a335d LD IX,(&5d33)
be8f(086f)     3a595d LD A,(&5d59)
be92(0872)         b7 OR A
be93(0873)         c8 RET Z
be94(0874)     3addbd LD A,(&bddd)
be97(0877)         b7 OR A
be98(0878)         c8 RET Z
be99(0879)   ed5b245d LD   DE,(&5d24)
be9d(087d)     cd1261 CALL &6112
bea0(0880)     dd7e16 LD A,(IX+22)
bea3(0883)         77 LD (HL),A
bea4(0884)   ed5bdbbd LD   DE,(&bddb)
bea8(0888)   ed53245d LD   (&5d24),DE
beac(088c)     cd1261 CALL &6112
beaf(088f)     222f5d LD (&5d2f),HL
beb2(0892)         46 LD B,(HL)
beb3(0893)     3a265d LD A,(&5d26)
beb6(0896)         77 LD (HL),A
beb7(0897)     dd7016 LD (IX+22),B
beba(089a)   dd360600 LD (IX+0),&06
bebe(089e)     cdc174 CALL &74c1
bec1(08a1)       3e01 LD A,&01
bec3(08a3)     32375d LD (&5d37),A
bec6(08a6)     cd2ab6 CALL &b62a
bec9(08a9)         c9 RET

???
(b714)=1
(a5dc)=(5d24)
(a5de)=a5ca
(5dfb) = 5b00
8 times:
    (5d24) = (a5dc)
    (5d3a) = (5d24) + ((a5de) + 2n)
    (5d3b) = (5d25) + ((a5de) + 2n + 1)
    (5d24) = (5d3a) [word]
    ((5dfb) + 3n) = (5d3a) [word]
    ???
    (5d3e) = HL
    ???
    if (5b97)!=ff && ((5d3e)) < 8c:
        ???
        ???
        IY += (IX+4) [byte]
        if (IY) != ff: ((5dfb) + 3n + 2) = (IY) [byte]
        else: ((5dfb) + 3n + 2) = ff
    else: ((5dfb) + 3n + 2) = ff
(5dfd) = 7
(a578) = 5b00
???
(bddb) = (5b00) [word]
(bddd) = (5b02)+1 [byte]
(5d24) = (a5dc)
Set up ix/5d37?
ix=(5d33)
if (5d59) == 0 || (bddd) == 0: `return`
de=(5d24)
???
(hl)=(ix+22)
(5d24) = (bddb) [word]
???
(5d2f)=hl
(hl)=(5d26)
(ix+22)=((5d2f))
(ix)=6
???
(5d37) = 1
The amazing 11x11 grid
`return`

## Set up ix/5d37?

beca(08aa) x7: cdcf99 CALL &99cf
becd(08ad)     cdd771 CALL &71d7
bed0(08b0)   dd2a335d LD IX,(&5d33)
bed4(08b4)     dd7e24 LD A,(IX+36)
bed7(08b7)         b7 OR A
bed8(08b8)       2006 JR NZ,a:8
beda(08ba)       3e01 LD A,&01
bedc(08bc)     32375d LD (&5d37),A
bedf(08bf)  a:     c9 RET

???
???
ix=(5d33)
if (ix+36) == 0:
    (5d37)=1
return

## Unknown

bfd4(09b4)            ; DATA - OUT - byte
bfd5(09b5)            ; DATA - OUT - byte
bfd6(09b6)     3a265d LD A,(&5d26)
bfd9(09b9)         f5 PUSH AF
bfda(09ba)     2a245d LD HL,(&5d24)
bfdd(09bd)     223a5d LD (&5d3a),HL
bfe0(09c0)     cd52b8 CALL &b852
bfe3(09c3)     327bb8 LD (&b87b),A
bfe6(09c6)     21ff5a LD HL,&5aff
bfe9(09c9)     22fb5d LD (&5dfb),HL
bfec(09cc)       3e8b LD A,&8b
bfee(09ce)     32265d LD (&5d26),A
bff1(09d1) a:  3a265d LD A,(&5d26)
bff4(09d4)         3c INC A
bff5(09d5)       fea0 CP &a0
bff7(09d7)     cab5c0 JP Z,y0:&c0b5
bffa(09da)     2afb5d LD HL,(&5dfb)
bffd(09dd)         23 INC HL
bffe(09de)         77 LD (HL),A
bfff(09df)         23 INC HL
c000(09e0)       3600 LD (HL),&00
c002(09e2)     22fb5d LD (&5dfb),HL
c005(09e5)     32265d LD (&5d26),A
c008(09e8)     cdc267 CALL &67c2
c00b(09eb)   ddcb2546 BIT 0,(IX+37)
c00f(09ef)       20e0 JR NZ,a:-30
c011(09f1)     dd7e08 LD A,(IX+8)
c014(09f4)         b7 OR A
c015(09f5)       28da JR Z,a:-36
c017(09f7)     3a265d LD A,(&5d26)
c01a(09fa)     cde4c0 CALL &c0e4
c01d(09fd)   ed533a5d LD   (&5d3a),DE
c021(0a01)     cd52b8 CALL &b852
c024(0a04)         b7 OR A
c025(0a05)       28ca JR Z,a:-52
c027(0a07)     327cb8 LD (&b87c),A
c02a(0a0a)     dd7e27 LD A,(IX+39)
c02d(0a0d)     2afb5d LD HL,(&5dfb)
c030(0a10)         77 LD (HL),A
c031(0a11)     cd5d78 CALL &785d
c034(0a14)     3a8f5d LD A,(&5d8f)
c037(0a17)         b7 OR A
c038(0a18)       281f JR Z,b:33
c03a(0a1a)         47 LD B,A
c03b(0a1b)     217a5b LD HL,&5b7a
c03e(0a1e)  d:     e5 PUSH HL
c03f(0a1f)         7e LD A,(HL)
c040(0a20)       d66e SUB A,&6e
c042(0a22)         5f LD E,A
c043(0a23)       1600 LD D,&00
c045(0a25)     213ec2 LD HL,&c23e
c048(0a28)         19 ADD HL,DE
c049(0a29)         7e LD A,(HL)
c04a(0a2a)     2afb5d LD HL,(&5dfb)
c04d(0a2d)         86 ADD A,(HL)
c04e(0a2e)       3002 JR NC,4
c050(0a30)       3eff LD A,&ff
c052(0a32)         77 LD (HL),A
c053(0a33)         e1 POP HL
c054(0a34)         23 INC HL
c055(0a35)         23 INC HL
c056(0a36)         23 INC HL
c057(0a37)       10e5 DJNZ d:-25
c059(0a39)b: fd2a86ba LD IY,(&ba86)
c05d(0a3d)     fd7e09 LD A,(IY+9)
c060(0a40)         6f LD L,A
c061(0a41)       2600 LD H,&00
c063(0a43)         29 ADD HL,HL
c064(0a44)         29 ADD HL,HL
c065(0a45)         29 ADD HL,HL
c066(0a46)         29 ADD HL,HL
c067(0a47)         29 ADD HL,HL
c068(0a48)     3a7cb8 LD A,(&b87c)
c06b(0a4b)         3d DEC A
c06c(0a4c)         5f LD E,A
c06d(0a4d)       1600 LD D,&00
c06f(0a4f)         19 ADD HL,DE
c070(0a50)     111ec2 LD DE,&c21e
c073(0a53)         19 ADD HL,DE
c074(0a54)         7e LD A,(HL)
c075(0a55)         b7 OR A
c076(0a56)       2008 JR NZ,f:10
c078(0a58)     2afb5d LD HL,(&5dfb)
c07b(0a5b)       3600 LD (HL),&00
c07d(0a5d)     c3f1bf JP a:&bff1
c080(0a60) f:  2afb5d LD HL,(&5dfb)
c083(0a63)         86 ADD A,(HL)
c084(0a64)       3002 JR NC,g:4
c086(0a66)       3eff LD A,&ff
c088(0a68) g:      77 LD (HL),A
c089(0a69)     cd7db8 CALL &b87d
c08c(0a6c)         47 LD B,A
c08d(0a6d)       3eff LD A,&ff
c08f(0a6f)         90 SUB A,B
c090(0a70)       cb3f SRL A
c092(0a72)     2afb5d LD HL,(&5dfb)
c095(0a75)         86 ADD A,(HL)
c096(0a76)       3002 JR NC,h:4
c098(0a78)       3eff LD A,&ff
c09a(0a7a) h:      77 LD (HL),A
c09b(0a7b)     3a265d LD A,(&5d26)
c09e(0a7e)       d68c SUB A,&8c
c0a0(0a80)         5f LD E,A
c0a1(0a81)       1600 LD D,&00
c0a3(0a83)     213ab6 LD HL,&b63a
c0a6(0a86)         19 ADD HL,DE
c0a7(0a87)         7e LD A,(HL)
c0a8(0a88)     2afb5d LD HL,(&5dfb)
c0ab(0a8b)         86 ADD A,(HL)
c0ac(0a8c)     d2b1c0 JP NC,x6:&c0b1
c0af(0a8f)       3eff LD A,&ff
c0b1(0a91)  x6:    77 LD (HL),A
c0b2(0a92)     c3f1bf JP a:&bff1
c0b5(0a95) y0:     f1 POP AF
c0b6(0a96)     32265d LD (&5d26),A
c0b9(0a99)   fd21005b LD IY,&5b00
c0bd(0a9d)       0614 LD B,&14
c0bf(0a9f)         af XOR A
c0c0(0aa0)     32d4bf LD (&bfd4),A
c0c3(0aa3)     32d5bf LD (&bfd5),A
c0c6(0aa6)     110200 LD DE,&0002
c0c9(0aa9) g:  fd7e01 LD A,(IY+1)
c0cc(0aac)     21d5bf LD HL,&bfd5
c0cf(0aaf)         be CP (HL)
c0d0(0ab0)       3809 JR C,f:11
c0d2(0ab2)     32d5bf LD (&bfd5),A
c0d5(0ab5)     fd7e00 LD A,(IY+0)
c0d8(0ab8)     32d4bf LD (&bfd4),A
c0db(0abb) f:    fd19 ADD IY,DE
c0dd(0abd)       10ea DJNZ g:-20
c0df(0abf)   dd2a335d LD IX,(&5d33)
c0e3(0ac3)         c9 RET

a=(5d26)
(5d3a)=(5d24) [word]
Find box for 5d3a-5d3b -> (b87b)
(5dfb)=5aff
(5d26)=8b (139)
while (5d26)+1 != a0: // 160
    ((5dfb)+1) = (5d26)+1
    ((5dfb)+2) = 0
    (5dfb) = (5dfb)+2
    (5d26) = (5d26)+1
    ???
    if (ix+37)->0 != 0: `continue`
    if (ix+8) == 0: `continue`
    (5d3a) = (3 * ((5d26)-8c) + 5c51)
    Find box for 5d3a-5d3b -> A
    if !A: `continue`
    (b87c)=A
    ((5dfb))=(ix+39)
    ???
    if (5d8f)!=0:
        a times:
            ((5dfb)) += (c23e+(5b7a + 3n)-6e) [max 255]
    if (((ba86) + 9) * 32 + (b87c) - 1 + c21e) == 0:
        ((5dfb))=0
        `continue`
    ((5dfb)) += (((ba86) + 9) * 32 + (b87c) - 1 + c21e) [max 255]
    b=box pair mapping
    ((5dfb)) += (ff - b)/2 [max 255]
    ((5dfb)) += (b63a + (5d26) - 8c) [max 255]
(5d26)=(5d26)'
20 times:
    b=20
    bfd4=bfd5=0
    if (5b00+2n+1) >= (bfd5):
        (bfd5) = (5b00+2n+1)
        (bfd4) = (5b00+2n+0)
return(ix=(5d33))

## Set DE=8c memory base

c0e4(0ac4)       d68c SUB A,&8c
c0e6(0ac6)         6f LD L,A
c0e7(0ac7)       2600 LD H,&00
c0e9(0ac9)         29 ADD HL,HL
c0ea(0aca)         29 ADD HL,HL
c0eb(0acb)     11515c LD DE,&5c51
c0ee(0ace)         19 ADD HL,DE
c0ef(0acf)         5e LD E,(HL)
c0f0(0ad0)         23 INC HL
c0f1(0ad1)         56 LD D,(HL)
c0f2(0ad2)         c9 RET

So this sets DE=(4 * (a-8c) + 5c51); it does modify a and hl but that seems incidental.


## Fill 5c0a from 5d3a via c914/c21d -> b78a

c0f3(0ad3)     2a3a5d LD HL,(&5d3a)
c0f6(0ad6)     22475d LD (&5d47),HL
c0f9(0ad9)         af XOR A
c0fa(0ada)     328f5d LD (&5d8f),A
c0fd(0add)     210a5c LD HL,&5c0a
c100(0ae0)     22fb5d LD (&5dfb),HL
c103(0ae3)         3c INC A
c104(0ae4)     328ab7 LD (&b78a),A
c107(0ae7)     2a3a5d LD HL,(&5d3a)
c10a(0aea)     cd41bd CALL &bd41
c10d(0aed)         b7 OR A
c10e(0aee)       280d JR Z,a:15
c110(0af0)     2afb5d LD HL,(&5dfb)
c113(0af3)         77 LD (HL),A
c114(0af4)         23 INC HL
c115(0af5)     22fb5d LD (&5dfb),HL
c118(0af8)       3e01 LD A,&01
c11a(0afa)     328f5d LD (&5d8f),A
c11d(0afd) a:  2114c9 LD HL,&c914
c120(0b00)     3a1dc2 LD A,(&c21d)
c123(0b03)         47 LD B,A
c124(0b04) c:      c5 PUSH BC
c125(0b05)         e5 PUSH HL
c126(0b06)         5e LD E,(HL)
c127(0b07)         23 INC HL
c128(0b08)         56 LD D,(HL)
c129(0b09)   ed53495d LD   (&5d49),DE
c12d(0b0d)     cd0972 CALL &7209
c130(0b10)       200f JR NZ,b:17
c132(0b12)     2afb5d LD HL,(&5dfb)
c135(0b15)     3a8ab7 LD A,(&b78a)
c138(0b18)         77 LD (HL),A
c139(0b19)         23 INC HL
c13a(0b1a)     22fb5d LD (&5dfb),HL
c13d(0b1d)     218f5d LD HL,&5d8f
c140(0b20)         34 INC (HL)
c141(0b21) b:  218ab7 LD HL,&b78a
c144(0b24)         34 INC (HL)
c145(0b25)         e1 POP HL
c146(0b26)         23 INC HL
c147(0b27)         23 INC HL
c148(0b28)         c1 POP BC
c149(0b29)       10d9 DJNZ c:-37
c14b(0b2b)         c9 RET

(5d47) = (5d3a) [word]
(5d8f) = 0
(5dfb) = 5c0a
(b78a) = 1
if find (5d3a) in c914 -> A != 0:
    ((5dfb) + (5d8f)) = A
    (5d8f)++
(c21d) times:
    (5d49) = (c914 + 2n)
    if 7209->Z:
        ((5dfb) + (5d8f)) = (b78a)
        (5d8f)++
    (b78a)++

This looks like it works from the (5d3a)/(c914) relationship: if the find
works, it takes one step forward. However it's not mutable, so this isn't an
init routine, more a routine which may have a particular start.

## Op<HL> -> init {7091, 7093}

c14c(0b2c)x8:ed5b245d LD   DE,(&5d24)
c150(0b30)         d5 PUSH DE
c151(0b31)     22245d LD (&5d24),HL
c154(0b34)     cd6a72 CALL &726a
c157(0b37)     3a975b LD A,(&5b97)
c15a(0b3a)       feff CP &ff
c15c(0b3c)       2815 JR Z,a:23
c15e(0b3e)     3a265d LD A,(&5d26)
c161(0b41)       d68c SUB A,&8c
c163(0b43)         5f LD E,A
c164(0b44)       1600 LD D,&00
c166(0b46)     213ab6 LD HL,&b63a
c169(0b49)         19 ADD HL,DE
c16a(0b4a)     3af85d LD A,(&5df8)
c16d(0b4d)         77 LD (HL),A
c16e(0b4e)       3e01 LD A,&01
c170(0b50)     3214b7 LD (&b714),A
c173(0b53) a:  2ad85d LD HL,(&5dd8)
c176(0b56)     229170 LD (&7091),HL
c179(0b59)     2ad65d LD HL,(&5dd6)
c17c(0b5c)     229370 LD (&7093),HL
c17f(0b5f)         d1 POP DE
c180(0b60)   ed53245d LD   (&5d24),DE
c184(0b64)         c9 RET

In: HL

(5d24)=hl
???
if (5b97) != ff:
    (b63a+(5d26)-8c)=(5df8)
    (b714)=1
(7091)=(5dd8) [word]
(7093)=(5dd6) [word]

This retains the original version of 5d24 on return.

## Something something overwatch?

c185(0b65)     2a245d LD HL,(&5d24)
c188(0b68)         e5 PUSH HL
c189(0b69)       dde5 PUSH IX
c18b(0b6b)     2a3a5d LD HL,(&5d3a)
c18e(0b6e)     22245d LD (&5d24),HL
c191(0b71)     22495d LD (&5d49),HL

(5d24)=(5d49)=hl=(5d3a)

c194(0b74)     cd6a72 CALL &726a

???

c197(0b77)     21975b LD HL,&5b97
c19a(0b7a)     22fb5d LD (&5dfb),HL

(5dfb)=5b97

c19d(0b7d) c:  2afb5d LD HL,(&5dfb)
c1a0(0b80)         7e LD A,(HL)
c1a1(0b81)       feff CP &ff
c1a3(0b83)       2838 JR Z,a:58

if ((5dfb))==ff: return(Z)

c1a5(0b85)         5e LD E,(HL)
c1a6(0b86)         23 INC HL
c1a7(0b87)         56 LD D,(HL)
c1a8(0b88)   ed53475d LD   (&5d47),DE

(5d47)=((5dfb))

c1ac(0b8c)         23 INC HL
c1ad(0b8d)         7e LD A,(HL)

a=((5dfb)+2)

c1ae(0b8e)         23 INC HL
c1af(0b8f)     22fb5d LD (&5dfb),HL

(5dfb)+=3

c1b2(0b92)         47 LD B,A
c1b3(0b93)       d68c SUB A,&8c
c1b5(0b95)         5f LD E,A
c1b6(0b96)       1600 LD D,&00

b=a
de=a-8c

c1b8(0b98)     213ab6 LD HL,&b63a
c1bb(0b9b)         19 ADD HL,DE

hl=b63a+(a-8c)

c1bc(0b9c)         7e LD A,(HL)
c1bd(0b9d)         b7 OR A
c1be(0b9e)       28dd JR Z,c:-33

If (b63a+(a-8c)) == 0: jump back

c1c0(0ba0)         78 LD A,B

a=b

c1c1(0ba1)     cdc267 CALL &67c2
c1c4(0ba4)     cd2673 CALL &7326

??
??

c1c7(0ba7)         b7 OR A
c1c8(0ba8)       20d3 JR NZ,c:-43

If A != 0: jump back

c1ca(0baa)     dd7e1b LD A,(IX+27)
c1cd(0bad)     dd9611 SUB A,(IX+17)
c1d0(0bb0)     dd9619 SUB A,(IX+25)
c1d3(0bb3)       cb3f SRL A
c1d5(0bb5)     ddbe06 CP (IX+6)
c1d8(0bb8)       30c3 JR NC,c:-59
c1da(0bba)       3e01 LD A,&01
c1dc(0bbc)         b7 OR A
c1dd(0bbd) a:    dde1 POP IX
c1df(0bbf)         e1 POP HL
c1e0(0bc0)     22245d LD (&5d24),HL
c1e3(0bc3)         c9 RET

if (ix+6) > ((ix+27)-(ix+17)-(ix+25)) / 2: return(!Z)
else: `continue`

One of 726a, 67c2 or 7326 probably sets IX. Given the offsets, this is probably operating on unit stats (0x1d7f-0x209e local), meaning +6, +17, +25 and +27 may be ?(0x2f), armour??(0x02), ?(0x09) and action points (0x31). In this case, the question is whether `ap - x - y < z`, which may be an overwatch cost calculation.

5d24 gets replaced on exit with its original value.

## Init 11x11 grid

c1e4(0bc4) x9: 3a15b7 LD A,(&b715)
c1e7(0bc7)         b7 OR A
c1e8(0bc8)         c0 RET NZ
c1e9(0bc9)     210101 LD HL,&0101
c1ec(0bcc)     22fe5c LD (&5cfe),HL
c1ef(0bcf)       060b LD B,&0b
c1f1(0bd1) b:      c5 PUSH BC
c1f2(0bd2)       060b LD B,&0b
c1f4(0bd4) a:      c5 PUSH BC
c1f5(0bd5)         af XOR A
c1f6(0bd6)     32005d LD (&5d00),A
c1f9(0bd9)     cdaf60 CALL &60af
c1fc(0bdc)     21ff5c LD HL,&5cff
c1ff(0bdf)         34 INC (HL)
c200(0be0)         34 INC (HL)
c201(0be1)         c1 POP BC
c202(0be2)       10f0 DJNZ -14:a
c204(0be4)     3afe5c LD A,(&5cfe)
c207(0be7)       c602 ADD A,&02
c209(0be9)     32fe5c LD (&5cfe),A
c20c(0bec)       3e01 LD A,&01
c20e(0bee)     32ff5c LD (&5cff),A
c211(0bf1)         c1 POP BC
c212(0bf2)       10dd DJNZ -33:b
c214(0bf4)     3215b7 LD (&b715),A
c217(0bf7)       3e65 LD A,&65
c219(0bf9)     cd5e67 CALL &675e
c21c(0bfc)         c9 RET

b715 appears to be a recursion-protect flag. Outer loop (11x) apparently just adds 2 to 5cfe and sets 5cff to 1; inner loop calls 60af and adds 2 to 5cff. Under the circumstances, this is probably a loop over an 11x11 grid; given the complete absence of visible decisions, it's probably a build routine.

675e, called at the end with x65 (101), is probably some kind of finaliser.

It's possible that the underlying rendering is supposed to be 10x10. Adding 2 suggests memory addresses for 16-bit data. Smallest value for either (and the initial value for both) is 01.

c21d(0bfd)            ; DATA - single byte - index of last word in c914 - static 0x32 (50).
c21e(0bfe)            ; DATA
c23e(0c1e)            ; DATA

0x0bfd-0xc9f: ??

c266(0c46): 8-9 10-byte sequences like 01 17 15 23 28 00 00 00 00 00

0x0ca0: Three 32-byte sequences. Purpose isn't clear. There's 01 mapped as 01110111000000000000000000000000, and otherwise 02 x 32 and 03 x 32.


0x0d00: Rotation maps
0x0d20: Death animations
0x0d2c: String mapping starts
0x0f22: Strings start
0x111f: Strings end

c740(1120)            ; DATA

Length-tagged values (the "8x lists"). Ends with a plain 0x80.

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

The left side of each pair is linked to the box pair mappings (where 25/0x19 is a default). The right side is...

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

The odd (value 1) data appear to be memory offsets of some kind of identifying byte (from an indeterminate but static point).

0x126c [0xc88c] -0x12f3: 28x 5-byte values ending in a typically-incrementing number

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
ff

ff is the end marker; these are pairs of upper and lower bounds, such that if value1 is between the first two and value2 is between the second two, it's successful (returning the fifth datum and setting to the start). With those ranges going from 8-39 (left) and 19-71 (right) they could be map boxes.

c912(12f2)-c971(134f)?: Probable memory addresses, more than 1 but not clear how many. First entry (19 ff) is garbage so it may be that offset 0 is never used (making it really c914/12f4). It looks like there are 47+ running from 1b0d to 3d14. Minimum distance between entries is 1.

These may well be map coordinates, as they are considered for the boxes above

1b0d
1b14
1c19
1d10
1d11
1d24
1f16
200c
210f
2113
2119
211a
2120
2121
2418
2519
251f
2611
2710
2712
2814
2820
2917
2a1a
2a1e
2b13
2c1f
2c21
2d14
2e23
2f15
2f17
3113
3315
331a
3511
3610
3518
3811
3816
381a
3a0d
3b1d
3c13
3d12
3d14

0xc978(0x1358)-~???(0x1483): box ID pair mappings. Numbers in the 0x05-0x38 range. Definitely a single byte. 49 distinct values in total, firmly clustered around the middle (range here is 52). These numbers are supposed to correspond to the data in the 8x lists. Since they are considered as scalar values, these may in fact be *distances* or some approximation thereof.

   4 05
   1 06
   1 07
   5 08
   8 09
   2 0a
   6 0b
   6 0c
   4 0d
   6 0e
   3 0f
   9 10
   9 11
   9 12
   7 13
   5 14
   7 15
   7 16
  12 17
   6 18
   8 19
  10 1a
   8 1b
  11 1c
  10 1d
  11 1e
  14 1f
  15 20
   3 21
  10 22
   4 23
   7 24
   8 25
   6 26
   6 27
   7 28
   8 29
   5 2a
   5 2b
   5 2c
   5 2d
   5 2e
   3 2f
   1 30
   3 31
   1 32
   1 33
   2 35
   1 38


0xcaa4(0x1484)-0xcfa7(0x1987): Fixed tile attributes (107x)

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