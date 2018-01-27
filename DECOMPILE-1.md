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

b621(0001)     c39fb8 JP &b89f
b624(0004)     c3cabe JP &beca
b627(0007)     c34cc1 JP &c14c
b62a(000a)     c3e4c1 JP &c1e4
b62d(000d)         c9 RET
b630(0010)         c9 RET
b633(0013)         c9 RET
b636(0016)         c9 RET

b63a(001a)            ; DATA

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

b713(00f3)            ; DATA
b714(00f4)            ; DATA
b715(00f5)            ; DATA

0x00f6-0x00f8: Unknown data (5f e6 0a)

(nulls)

0x00fd-0x010c: 8x number pairs: c2 20, c3 40, c3 4c, c3 30, c5 a4, ca a8, cf 4c, d1 00

b72c(010c)            ; DATA
b72e(010e)            ; DATA
b72f(010f)            ; DATA
b731(0111)            ; DATA
b732(0112)     322eb7 LD (&b72e),A
b735(0115)         4f LD C,A
b736(0116)     2140c7 LD HL,&c740
b739(0119)     3a31b7 LD A,(&b731)
b73c(011c)         47 LD B,A
b73d(011d)         7e LD A,(HL)
b73e(011e)       e67f AND &7f
b740(0120)         5f LD E,A
b741(0121)       1600 LD D,&00
b743(0123)         19 ADD HL,DE
b744(0124)       10f7 DJNZ -7
b746(0126)         23 INC HL
b747(0127)     222fb7 LD (&b72f),HL
b74a(012a)         09 ADD HL,BC
b74b(012b)         09 ADD HL,BC
b74c(012c)         7e LD A,(HL)
b74d(012d)       cb7f BIT 7,A
b74f(012f)         c0 RET NZ
b750(0130)         e5 PUSH HL
b751(0131)     cd78b7 CALL &b778
b754(0134)         e1 POP HL
b755(0135)       200c JR NZ,14
b757(0137)     212eb7 LD HL,&b72e
b75a(013a)         34 INC (HL)
b75b(013b)         4e LD C,(HL)
b75c(013c)       0600 LD B,&00
b75e(013e)     2a2fb7 LD HL,(&b72f)
b761(0141)       18e7 JR -23
b763(0143)     3231b7 LD (&b731),A
b766(0146)         23 INC HL
b767(0147)   fd2a2cb7 LD IY,(&b72c)
b76b(014b)     fd7eff LD A,(IY+-1)
b76e(014e)         86 ADD A,(HL)
b76f(014f)     2187b7 LD HL,&b787
b772(0152)         be CP (HL)
b773(0153)       30e2 JR NC,-28
b775(0155)         47 LD B,A
b776(0156)         af XOR A
b777(0157)         c9 RET
b778(0158)     21015b LD HL,&5b01
b77b(015b)     110300 LD DE,&0003
b77e(015e)       0632 LD B,&32
b780(0160)         be CP (HL)
b781(0161)         c8 RET Z
b782(0162)         19 ADD HL,DE
b783(0163)       10fb DJNZ -3
b785(0165)         a7 AND A
b786(0166)         c9 RET
b787(0167)            ; DATA
b788(0168)            ; DATA
b789(0169)            ; DATA
b78a(016a)            ; DATA
b78b(016b)            ; DATA
b78c(016c)       3e00 LD A,&00
b78e(016e)     328bb7 LD (&b78b),A
b791(0171)     21015b LD HL,&5b01
b794(0174)     222cb7 LD (&b72c),HL
b797(0177)     21015b LD HL,&5b01
b79a(017a)       36ff LD (HL),&ff
b79c(017c)     11025b LD DE,&5b02
b79f(017f)     019500 LD BC,&0095
b7a2(0182)       edb0 LDIR
b7a4(0184)     3a88b7 LD A,(&b788)
b7a7(0187)     cd3fb8 CALL &b83f
b7aa(018a)     cd52b8 CALL &b852
b7ad(018d)     327bb8 LD (&b87b),A
b7b0(0190)     3a89b7 LD A,(&b789)
b7b3(0193)     cd3fb8 CALL &b83f
b7b6(0196)     cd52b8 CALL &b852
b7b9(0199)     327cb8 LD (&b87c),A
b7bc(019c)     217bb8 LD HL,&b87b
b7bf(019f)         be CP (HL)
b7c0(01a0)       2004 JR NZ,6
b7c2(01a2)       3e19 LD A,&19
b7c4(01a4)       1803 JR 5
b7c6(01a6)     cd7db8 CALL &b87d
b7c9(01a9)     3287b7 LD (&b787),A
b7cc(01ac)         af XOR A
b7cd(01ad)     32005b LD (&5b00),A
b7d0(01b0)     328ab7 LD (&b78a),A
b7d3(01b3)     3a88b7 LD A,(&b788)
b7d6(01b6)     3231b7 LD (&b731),A
b7d9(01b9)     3a31b7 LD A,(&b731)
b7dc(01bc)     2a2cb7 LD HL,(&b72c)
b7df(01bf)         77 LD (HL),A
b7e0(01c0)     3a89b7 LD A,(&b789)
b7e3(01c3)         be CP (HL)
b7e4(01c4)       2838 JR Z,58
b7e6(01c6)         23 INC HL
b7e7(01c7)         34 INC (HL)
b7e8(01c8)         7e LD A,(HL)
b7e9(01c9)         e5 PUSH HL
b7ea(01ca)     cd32b7 CALL &b732
b7ed(01cd)         e1 POP HL
b7ee(01ce)       2010 JR NZ,18
b7f0(01d0)     3a2eb7 LD A,(&b72e)
b7f3(01d3)         77 LD (HL),A
b7f4(01d4)         23 INC HL
b7f5(01d5)         70 LD (HL),B
b7f6(01d6)         23 INC HL
b7f7(01d7)     222cb7 LD (&b72c),HL
b7fa(01da)     218ab7 LD HL,&b78a
b7fd(01dd)         34 INC (HL)
b7fe(01de)       18d9 JR -37
b800(01e0)     3a8ab7 LD A,(&b78a)
b803(01e3)         b7 OR A
b804(01e4)         c8 RET Z
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
b81c(01fc)       18bb JR -67
b81e(01fe)         2b DEC HL
b81f(01ff)         7e LD A,(HL)
b820(0200)     3287b7 LD (&b787),A
b823(0203)       3e01 LD A,&01
b825(0205)     328bb7 LD (&b78b),A
b828(0208)       060a LD B,&0a
b82a(020a)     21015b LD HL,&5b01
b82d(020d)   fd21f05c LD IY,&5cf0
b831(0211)     110300 LD DE,&0003
b834(0214)         7e LD A,(HL)
b835(0215)     fd7700 LD (IY+0),A
b838(0218)       fd23 INC IY
b83a(021a)         19 ADD HL,DE
b83b(021b)       10f7 DJNZ -7
b83d(021d)       18c1 JR -61
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
b852(0232)     218cc8 LD HL,&c88c
b855(0235)     110500 LD DE,&0005
b858(0238)         e5 PUSH HL
b859(0239)     3a3a5d LD A,(&5d3a)
b85c(023c)         be CP (HL)
b85d(023d)       3813 JR C,21
b85f(023f)         23 INC HL
b860(0240)         be CP (HL)
b861(0241)       300f JR NC,17
b863(0243)         23 INC HL
b864(0244)     3a3b5d LD A,(&5d3b)
b867(0247)         be CP (HL)
b868(0248)       3808 JR C,10
b86a(024a)         23 INC HL
b86b(024b)         be CP (HL)
b86c(024c)       3004 JR NC,6
b86e(024e)         23 INC HL
b86f(024f)         7e LD A,(HL)
b870(0250)         e1 POP HL
b871(0251)         c9 RET
b87b(025b)            ; DATA
b87c(025c)            ; DATA
b87d(025d)     3a7bb8 LD A,(&b87b)
b880(0260)         4f LD C,A
b881(0261)     217cb8 LD HL,&b87c
b884(0264)         46 LD B,(HL)
b885(0265)         b8 CP B
b886(0266)       2002 JR NZ,4
b888(0268)         af XOR A
b889(0269)         c9 RET
b89d(027d)            ; DATA
b89e(027e)            ; DATA
b89f(027f)     cd8567 CALL &6785
b8a2(0282)     cd2ab6 CALL &b62a
b8a5(0285)     21505c LD HL,&5c50
b8a8(0288)       0614 LD B,&14
b8aa(028a)         c5 PUSH BC
b8ab(028b)         e5 PUSH HL
b8ac(028c)         7e LD A,(HL)
b8ad(028d)       fe01 CP &01
b8af(028f)     c24dba JP NZ,&ba4d
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
b8ff(02df)       2022 JR NZ,36
b901(02e1)     cd5d78 CALL &785d
b904(02e4)     dd7e23 LD A,(IX+35)
b907(02e7)     cddf67 CALL &67df
b90a(02ea)   dd22c25d LD (&5dc2),IX
b90e(02ee)     dd7e10 LD A,(IX+16)
b911(02f1)     cdab78 CALL &78ab
b914(02f4)   dd2a335d LD IX,(&5d33)
b918(02f8)       2009 JR NZ,11
b91a(02fa)     cde962 CALL &62e9
b91d(02fd)     cd019d CALL &9d01
b920(0300)     cd8b6a CALL &6a8b
b923(0303)     3a595d LD A,(&5d59)
b926(0306)         b7 OR A
b927(0307)     c4debd CALL NZ,&bdde
b92a(030a)     3a375d LD A,(&5d37)
b92d(030d)         b7 OR A
b92e(030e)     c24dba JP NZ,&ba4d
b931(0311)     cd5cba CALL &ba5c
b934(0314)     c2ffb9 JP NZ,&b9ff
b937(0317)   fd2a86ba LD IY,(&ba86)
b93b(031b)   fdcb085e rrc (iy+94)->b
b93f(031f)     c2cfb9 JP NZ,&b9cf
b942(0322)     cdd6bf CALL &bfd6
b945(0325)     3ad4bf LD A,(&bfd4)
b948(0328)         b7 OR A
b949(0329)     cacfb9 JP Z,&b9cf
b94c(032c)       d68c SUB A,&8c
b94e(032e)         5f LD E,A
b94f(032f)       1600 LD D,&00
b951(0331)     213ab6 LD HL,&b63a
b954(0334)         19 ADD HL,DE
b955(0335)         7e LD A,(HL)
b956(0336)         b7 OR A
b957(0337)     cacfb9 JP Z,&b9cf
b95a(033a)     3ad4bf LD A,(&bfd4)
b95d(033d)     cde4c0 CALL &c0e4
b960(0340)   ed533a5d LD   (&5d3a),DE
b964(0344)     cdf3c0 CALL &c0f3
b967(0347)     3a8f5d LD A,(&5d8f)
b96a(034a)         b7 OR A
b96b(034b)       2862 JR Z,100
b96d(034d)     cd66bd CALL &bd66
b970(0350)     3288b7 LD (&b788),A
b973(0353)     3a8f5d LD A,(&5d8f)
b976(0356)         47 LD B,A
b977(0357)     210a5c LD HL,&5c0a
b97a(035a)       3eff LD A,&ff
b97c(035c)     329db8 LD (&b89d),A
b97f(035f)         c5 PUSH BC
b980(0360)         e5 PUSH HL
b981(0361)         7e LD A,(HL)
b982(0362)     3289b7 LD (&b789),A
b985(0365)     cd8cb7 CALL &b78c
b988(0368)     3a8bb7 LD A,(&b78b)
b98b(036b)         b7 OR A
b98c(036c)       2812 JR Z,20
b98e(036e)     3a87b7 LD A,(&b787)
b991(0371)     219db8 LD HL,&b89d
b994(0374)         be CP (HL)
b995(0375)       3009 JR NC,11
b997(0377)     329db8 LD (&b89d),A
b99a(037a)     3a89b7 LD A,(&b789)
b99d(037d)     32afba LD (&baaf),A
b9a0(0380)         e1 POP HL
b9a1(0381)         23 INC HL
b9a2(0382)         c1 POP BC
b9a3(0383)       10da DJNZ -36
b9a5(0385)         af XOR A
b9a6(0386)     329eb8 LD (&b89e),A
b9a9(0389)     cdb1ba CALL &bab1
b9ac(038c)     3a625d LD A,(&5d62)
b9af(038f)         b7 OR A
b9b0(0390)       204d JR NZ,79
b9b2(0392)     3a375d LD A,(&5d37)
b9b5(0395)         b7 OR A
b9b6(0396)     c24dba JP NZ,&ba4d
b9b9(0399)     3a595d LD A,(&5d59)
b9bc(039c)         b7 OR A
b9bd(039d)     c4debd CALL NZ,&bdde
b9c0(03a0)     3a375d LD A,(&5d37)
b9c3(03a3)         b7 OR A
b9c4(03a4)     c24dba JP NZ,&ba4d
b9c7(03a7)     cd5cba CALL &ba5c
b9ca(03aa)       2033 JR NZ,53
b9cc(03ac)     c342b9 JP &b942
b9cf(03af)   fd2a86ba LD IY,(&ba86)
b9d3(03b3)         af XOR A
b9d4(03b4)     329eb8 LD (&b89e),A
b9d7(03b7)   fdcb0846 rrc (iy+70)->b
b9db(03bb)       2014 JR NZ,22
b9dd(03bd)   fdcb084e rrc (iy+78)->b
b9e1(03c1)       2006 JR NZ,8
b9e3(03c3)     3a14b7 LD A,(&b714)
b9e6(03c6)         b7 OR A
b9e7(03c7)       2808 JR Z,10
b9e9(03c9)     dd7e05 LD A,(IX+5)
b9ec(03cc)       cb3f SRL A
b9ee(03ce)     329eb8 LD (&b89e),A
b9f1(03d1)     cd88ba CALL &ba88
b9f4(03d4)     cd5cba CALL &ba5c
b9f7(03d7)       2006 JR NZ,8
b9f9(03d9)     3a625d LD A,(&5d62)
b9fc(03dc)         b7 OR A
b9fd(03dd)       283d JR Z,63
b9ff(03df)     dd7e08 LD A,(IX+8)
ba02(03e2)         b7 OR A
ba03(03e3)       2848 JR Z,74
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
ba2d(040d)     ca42b9 JP Z,&b942
ba30(0410)     cddebd CALL &bdde
ba33(0413)     3a375d LD A,(&5d37)
ba36(0416)         b7 OR A
ba37(0417)       2014 JR NZ,22
ba39(0419)     c342b9 JP &b942
ba4d(042d)         e1 POP HL
ba4e(042e)     110400 LD DE,&0004
ba51(0431)         19 ADD HL,DE
ba52(0432)         c1 POP BC
ba53(0433)         05 DEC B
ba54(0434)     c2aab8 JP NZ,&b8aa
ba57(0437)         af XOR A
ba58(0438)     32365d LD (&5d36),A
ba5b(043b)         c9 RET
ba5c(043c)     21995b LD HL,&5b99
ba5f(043f)         7e LD A,(HL)
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
ba70(0450)       200b JR NZ,13
ba72(0452)         f1 POP AF
ba73(0453)         e1 POP HL
ba74(0454)         23 INC HL
ba75(0455)         7e LD A,(HL)
ba76(0456)       feff CP &ff
ba78(0458)         c8 RET Z
ba79(0459)         23 INC HL
ba7a(045a)         23 INC HL
ba7b(045b)       18e2 JR -28
ba7d(045d)         f1 POP AF
ba7e(045e)         e1 POP HL
ba7f(045f)     3213b7 LD (&b713),A
ba82(0462)       3e01 LD A,&01
ba84(0464)         b7 OR A
ba85(0465)         c9 RET
ba86(0466)            ; DATA
ba88(0468)         af XOR A
ba89(0469)     32d4bf LD (&bfd4),A
ba8c(046c)     2a86ba LD HL,(&ba86)
ba8f(046f)         5e LD E,(HL)
ba90(0470)       1600 LD D,&00
ba92(0472)         19 ADD HL,DE
ba93(0473)         7e LD A,(HL)
ba94(0474)     32afba LD (&baaf),A
ba97(0477)         b7 OR A
ba98(0478)       2007 JR NZ,9
ba9a(047a)     2a86ba LD HL,(&ba86)
ba9d(047d)       3601 LD (HL),&01
ba9f(047f)       18e7 JR -23
baa1(0481)     cdb1ba CALL &bab1
baa4(0484)     3ab0ba LD A,(&bab0)
baa7(0487)         b7 OR A
baa8(0488)         c8 RET Z
baa9(0489)     2a86ba LD HL,(&ba86)
baac(048c)         34 INC (HL)
baad(048d)       18d9 JR -37
baaf(048f)            ; DATA
bab0(0490)            ; DATA
bab1(0491)         af XOR A
bab2(0492)     32b0ba LD (&bab0),A
bab5(0495)     2a245d LD HL,(&5d24)
bab8(0498)     cd41bd CALL &bd41
babb(049b)     21afba LD HL,&baaf
babe(049e)         be CP (HL)
babf(049f)       200c JR NZ,14
bac1(04a1)       3e01 LD A,&01
bac3(04a3)     32b0ba LD (&bab0),A
bac6(04a6)     3ad4bf LD A,(&bfd4)
bac9(04a9)         b7 OR A
baca(04aa)       205e JR NZ,96
bacc(04ac)         c9 RET
bca3(0683)            ; DATA
bca4(0684)            ; DATA
bca5(0685)            ; DATA
bca6(0686)     2a3a5d LD HL,(&5d3a)
bca9(0689)     22dca5 LD (&a5dc),HL
bcac(068c)     dd7e21 LD A,(IX+33)
bcaf(068f)     32a3bc LD (&bca3),A
bcb2(0692)         af XOR A
bcb3(0693)     32a5bc LD (&bca5),A
bcb6(0696)     3aa3bc LD A,(&bca3)
bcb9(0699)     cd746e CALL &6e74
bcbc(069c)     2adca5 LD HL,(&a5dc)
bcbf(069f)   ed5b3a5d LD   DE,(&5d3a)
bcc3(06a3)         a7 AND A
bcc4(06a4)       ed52 SBC  HL,DE
bcc6(06a6)       2815 JR Z,23
bcc8(06a8)     21a5bc LD HL,&bca5
bccb(06ab)         34 INC (HL)
bccc(06ac)     3aa3bc LD A,(&bca3)
bccf(06af)         3c INC A
bcd0(06b0)     32a3bc LD (&bca3),A
bcd3(06b3)       fe08 CP &08
bcd5(06b5)       38df JR C,-31
bcd7(06b7)         af XOR A
bcd8(06b8)     32a3bc LD (&bca3),A
bcdb(06bb)       18d9 JR -37
bcdd(06bd)         af XOR A
bcde(06be)     32a4bc LD (&bca4),A
bce1(06c1)     dd7e21 LD A,(IX+33)
bce4(06c4)     32a3bc LD (&bca3),A
bce7(06c7)     3aa3bc LD A,(&bca3)
bcea(06ca)     cd746e CALL &6e74
bced(06cd)     2adca5 LD HL,(&a5dc)
bcf0(06d0)   ed5b3a5d LD   DE,(&5d3a)
bcf4(06d4)         a7 AND A
bcf5(06d5)       ed52 SBC  HL,DE
bcf7(06d7)       2816 JR Z,24
bcf9(06d9)     21a4bc LD HL,&bca4
bcfc(06dc)         34 INC (HL)
bcfd(06dd)     3aa3bc LD A,(&bca3)
bd00(06e0)         3d DEC A
bd01(06e1)     32a3bc LD (&bca3),A
bd04(06e4)       feff CP &ff
bd06(06e6)       20df JR NZ,-31
bd08(06e8)       3e07 LD A,&07
bd0a(06ea)     32a3bc LD (&bca3),A
bd0d(06ed)       18d8 JR -38
bd0f(06ef)     3aa5bc LD A,(&bca5)
bd12(06f2)         b7 OR A
bd13(06f3)       2826 JR Z,40
bd15(06f5)     21a4bc LD HL,&bca4
bd18(06f8)         be CP (HL)
bd19(06f9)       3811 JR C,19
bd1b(06fb)     3aa4bc LD A,(&bca4)
bd1e(06fe)         47 LD B,A
bd1f(06ff)         c5 PUSH BC
bd20(0700)     cdde6d CALL &6dde
bd23(0703)         c1 POP BC
bd24(0704)     cdb3bd CALL &bdb3
bd27(0707)         c8 RET Z
bd28(0708)       10f5 DJNZ -9
bd2a(070a)       180f JR 17
bd2c(070c)     3aa5bc LD A,(&bca5)
bd2f(070f)         47 LD B,A
bd30(0710)         c5 PUSH BC
bd31(0711)     cdaf6d CALL &6daf
bd34(0714)         c1 POP BC
bd35(0715)     cdb3bd CALL &bdb3
bd38(0718)         c8 RET Z
bd39(0719)       10f5 DJNZ -9
bd3b(071b)       3e01 LD A,&01
bd3d(071d)         b7 OR A
bd3e(071e)         c9 RET
bd3f(071f)            ; DATA
bd40(0720)            ; DATA
bd41(0721)     223fbd LD (&bd3f),HL
bd44(0724)     2114c9 LD HL,&c914
bd47(0727)     3a1dc2 LD A,(&c21d)
bd4a(072a)         47 LD B,A
bd4b(072b)     3a3fbd LD A,(&bd3f)
bd4e(072e)         be CP (HL)
bd4f(072f)       200d JR NZ,15
bd51(0731)         23 INC HL
bd52(0732)     3a40bd LD A,(&bd40)
bd55(0735)         be CP (HL)
bd56(0736)       2007 JR NZ,9
bd58(0738)     3a1dc2 LD A,(&c21d)
bd5b(073b)         3c INC A
bd5c(073c)         90 SUB A,B
bd5d(073d)         c9 RET
bd64(0744)            ; DATA
bd65(0745)            ; DATA
bd66(0746)     2a245d LD HL,(&5d24)
bd69(0749)     cd41bd CALL &bd41
bd6c(074c)         b7 OR A
bd6d(074d)         c0 RET NZ
bd6e(074e)     2a245d LD HL,(&5d24)
bd71(0751)     224ba5 LD (&a54b),HL
bd74(0754)     22475d LD (&5d47),HL
bd77(0757)       3eff LD A,&ff
bd79(0759)     3265bd LD (&bd65),A
bd7c(075c)     3a1dc2 LD A,(&c21d)
bd7f(075f)         47 LD B,A
bd80(0760)     2114c9 LD HL,&c914
bd83(0763)         e5 PUSH HL
bd84(0764)         c5 PUSH BC
bd85(0765)         5e LD E,(HL)
bd86(0766)         23 INC HL
bd87(0767)         56 LD D,(HL)
bd88(0768)   ed534da5 LD   (&a54d),DE
bd8c(076c)   ed53495d LD   (&5d49),DE
bd90(0770)     cd0172 CALL &7201
bd93(0773)         c1 POP BC
bd94(0774)       2014 JR NZ,22
bd96(0776)     cd50a5 CALL &a550
bd99(0779)     2165bd LD HL,&bd65
bd9c(077c)         be CP (HL)
bd9d(077d)       300b JR NC,13
bd9f(077f)     3265bd LD (&bd65),A
bda2(0782)     3a1dc2 LD A,(&c21d)
bda5(0785)         3c INC A
bda6(0786)         90 SUB A,B
bda7(0787)     3264bd LD (&bd64),A
bdaa(078a)         e1 POP HL
bdab(078b)         23 INC HL
bdac(078c)         23 INC HL
bdad(078d)       10d4 DJNZ -42
bdaf(078f)     3a64bd LD A,(&bd64)
bdb2(0792)         c9 RET
bdb3(0793)     dd7e06 LD A,(IX+6)
bdb6(0796)         b7 OR A
bdb7(0797)       2814 JR Z,22
bdb9(0799)     219eb8 LD HL,&b89e
bdbc(079c)         96 SUB A,(HL)
bdbd(079d)       280e JR Z,16
bdbf(079f)     dd7e08 LD A,(IX+8)
bdc2(07a2)         b7 OR A
bdc3(07a3)       2808 JR Z,10
bdc5(07a5)     3a595d LD A,(&5d59)
bdc8(07a8)         b7 OR A
bdc9(07a9)       2009 JR NZ,11
bdcb(07ab)         3c INC A
bdcc(07ac)         c9 RET
bddb(07bb)            ; DATA
bddd(07bd)            ; DATA
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
bdfa(07da)         c5 PUSH BC
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
be37(0817)       2022 JR NZ,36
be39(0819)     2a3e5d LD HL,(&5d3e)
be3c(081c)         7e LD A,(HL)
be3d(081d)       fe8c CP &8c
be3f(081f)       301a JR NC,28
be41(0821)     cd4a6b CALL &6b4a
be44(0824)     cdf767 CALL &67f7
be47(0827)     dd5e04 LD E,(IX+4)
be4a(082a)       1600 LD D,&00
be4c(082c)       fd19 ADD IY,DE
be4e(082e)     fd7e00 LD A,(IY+0)
be51(0831)       feff CP &ff
be53(0833)       2806 JR Z,8
be55(0835)     2afb5d LD HL,(&5dfb)
be58(0838)         77 LD (HL),A
be59(0839)       1805 JR 7
be5b(083b)     2afb5d LD HL,(&5dfb)
be5e(083e)       36ff LD (HL),&ff
be60(0840)         23 INC HL
be61(0841)     22fb5d LD (&5dfb),HL
be64(0844)         c1 POP BC
be65(0845)       1093 DJNZ -107
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
beba(089a)     dd3606 LD (IX+0),&06
bebd(089d)         00 NOP
bebe(089e)     cdc174 CALL &74c1
bec1(08a1)       3e01 LD A,&01
bec3(08a3)     32375d LD (&5d37),A
bec6(08a6)     cd2ab6 CALL &b62a
bec9(08a9)         c9 RET
beca(08aa)     cdcf99 CALL &99cf
becd(08ad)     cdd771 CALL &71d7
bed0(08b0)   dd2a335d LD IX,(&5d33)
bed4(08b4)     dd7e24 LD A,(IX+36)
bed7(08b7)         b7 OR A
bed8(08b8)       2006 JR NZ,8
beda(08ba)       3e01 LD A,&01
bedc(08bc)     32375d LD (&5d37),A
bedf(08bf)         c9 RET
bfd4(09b4)            ; DATA
bfd5(09b5)            ; DATA
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
bff1(09d1)     3a265d LD A,(&5d26)
bff4(09d4)         3c INC A
bff5(09d5)       fea0 CP &a0
bff7(09d7)     cab5c0 JP Z,&c0b5
bffa(09da)     2afb5d LD HL,(&5dfb)
bffd(09dd)         23 INC HL
bffe(09de)         77 LD (HL),A
bfff(09df)         23 INC HL
c000(09e0)       3600 LD (HL),&00
c002(09e2)     22fb5d LD (&5dfb),HL
c005(09e5)     32265d LD (&5d26),A
c008(09e8)     cdc267 CALL &67c2
c00b(09eb)   ddcb2546 sla (IX+70)->l
c00f(09ef)       20e0 JR NZ,-30
c011(09f1)     dd7e08 LD A,(IX+8)
c014(09f4)         b7 OR A
c015(09f5)       28da JR Z,-36
c017(09f7)     3a265d LD A,(&5d26)
c01a(09fa)     cde4c0 CALL &c0e4
c01d(09fd)   ed533a5d LD   (&5d3a),DE
c021(0a01)     cd52b8 CALL &b852
c024(0a04)         b7 OR A
c025(0a05)       28ca JR Z,-52
c027(0a07)     327cb8 LD (&b87c),A
c02a(0a0a)     dd7e27 LD A,(IX+39)
c02d(0a0d)     2afb5d LD HL,(&5dfb)
c030(0a10)         77 LD (HL),A
c031(0a11)     cd5d78 CALL &785d
c034(0a14)     3a8f5d LD A,(&5d8f)
c037(0a17)         b7 OR A
c038(0a18)       281f JR Z,33
c03a(0a1a)         47 LD B,A
c03b(0a1b)     217a5b LD HL,&5b7a
c03e(0a1e)         e5 PUSH HL
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
c057(0a37)       10e5 DJNZ -25
c059(0a39)   fd2a86ba LD IY,(&ba86)
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
c076(0a56)       2008 JR NZ,10
c078(0a58)     2afb5d LD HL,(&5dfb)
c07b(0a5b)       3600 LD (HL),&00
c07d(0a5d)     c3f1bf JP &bff1
c0b5(0a95)         f1 POP AF
c0b6(0a96)     32265d LD (&5d26),A
c0b9(0a99)   fd21005b LD IY,&5b00
c0bd(0a9d)       0614 LD B,&14
c0bf(0a9f)         af XOR A
c0c0(0aa0)     32d4bf LD (&bfd4),A
c0c3(0aa3)     32d5bf LD (&bfd5),A
c0c6(0aa6)     110200 LD DE,&0002
c0c9(0aa9)     fd7e01 LD A,(IY+1)
c0cc(0aac)     21d5bf LD HL,&bfd5
c0cf(0aaf)         be CP (HL)
c0d0(0ab0)       3809 JR C,11
c0d2(0ab2)     32d5bf LD (&bfd5),A
c0d5(0ab5)     fd7e00 LD A,(IY+0)
c0d8(0ab8)     32d4bf LD (&bfd4),A
c0db(0abb)       fd19 ADD IY,DE
c0dd(0abd)       10ea DJNZ -20
c0df(0abf)   dd2a335d LD IX,(&5d33)
c0e3(0ac3)         c9 RET
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
c10e(0aee)       280d JR Z,15
c110(0af0)     2afb5d LD HL,(&5dfb)
c113(0af3)         77 LD (HL),A
c114(0af4)         23 INC HL
c115(0af5)     22fb5d LD (&5dfb),HL
c118(0af8)       3e01 LD A,&01
c11a(0afa)     328f5d LD (&5d8f),A
c11d(0afd)     2114c9 LD HL,&c914
c120(0b00)     3a1dc2 LD A,(&c21d)
c123(0b03)         47 LD B,A
c124(0b04)         c5 PUSH BC
c125(0b05)         e5 PUSH HL
c126(0b06)         5e LD E,(HL)
c127(0b07)         23 INC HL
c128(0b08)         56 LD D,(HL)
c129(0b09)   ed53495d LD   (&5d49),DE
c12d(0b0d)     cd0972 CALL &7209
c130(0b10)       200f JR NZ,17
c132(0b12)     2afb5d LD HL,(&5dfb)
c135(0b15)     3a8ab7 LD A,(&b78a)
c138(0b18)         77 LD (HL),A
c139(0b19)         23 INC HL
c13a(0b1a)     22fb5d LD (&5dfb),HL
c13d(0b1d)     218f5d LD HL,&5d8f
c140(0b20)         34 INC (HL)
c141(0b21)     218ab7 LD HL,&b78a
c144(0b24)         34 INC (HL)
c145(0b25)         e1 POP HL
c146(0b26)         23 INC HL
c147(0b27)         23 INC HL
c148(0b28)         c1 POP BC
c149(0b29)       10d9 DJNZ -37
c14b(0b2b)         c9 RET
c14c(0b2c)   ed5b245d LD   DE,(&5d24)
c150(0b30)         d5 PUSH DE
c151(0b31)     22245d LD (&5d24),HL
c154(0b34)     cd6a72 CALL &726a
c157(0b37)     3a975b LD A,(&5b97)
c15a(0b3a)       feff CP &ff
c15c(0b3c)       2815 JR Z,23
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
c173(0b53)     2ad85d LD HL,(&5dd8)
c176(0b56)     229170 LD (&7091),HL
c179(0b59)     2ad65d LD HL,(&5dd6)
c17c(0b5c)     229370 LD (&7093),HL
c17f(0b5f)         d1 POP DE
c180(0b60)   ed53245d LD   (&5d24),DE
c184(0b64)         c9 RET
c1e4(0bc4)     3a15b7 LD A,(&b715)
c1e7(0bc7)         b7 OR A
c1e8(0bc8)         c0 RET NZ
c1e9(0bc9)     210101 LD HL,&0101
c1ec(0bcc)     22fe5c LD (&5cfe),HL
c1ef(0bcf)       060b LD B,&0b
c1f1(0bd1)         c5 PUSH BC
c1f2(0bd2)       060b LD B,&0b
c1f4(0bd4)         c5 PUSH BC
c1f5(0bd5)         af XOR A
c1f6(0bd6)     32005d LD (&5d00),A
c1f9(0bd9)     cdaf60 CALL &60af
c1fc(0bdc)     21ff5c LD HL,&5cff
c1ff(0bdf)         34 INC (HL)
c200(0be0)         34 INC (HL)
c201(0be1)         c1 POP BC
c202(0be2)       10f0 DJNZ -14
c204(0be4)     3afe5c LD A,(&5cfe)
c207(0be7)       c602 ADD A,&02
c209(0be9)     32fe5c LD (&5cfe),A
c20c(0bec)       3e01 LD A,&01
c20e(0bee)     32ff5c LD (&5cff),A
c211(0bf1)         c1 POP BC
c212(0bf2)       10dd DJNZ -33
c214(0bf4)     3215b7 LD (&b715),A
c217(0bf7)       3e65 LD A,&65
c219(0bf9)     cd5e67 CALL &675e
c21c(0bfc)         c9 RET

c21d(0bfd)            ; DATA
c23e(0c1e)            ; DATA

0x0bfd-0xc9f: ??

0x0ca0: Three 32-byte sequences. Purpose isn't clear. There's 01 mapped as 01110111000000000000000000000000, and otherwise 02 x 32 and 03 x 32.


0x0d00: Rotation maps
0x0d20: Death animations
0x0d2c: String mapping starts
0x0f22: Strings start
0x111f: Strings end

c740(1120)            ; DATA

Length-tagged values. Ends with a plain 0x80.

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

c88c(126c)            ; DATA

0x126c-0x12f3: 28x 5-byte values ending in a typically-incrementing number

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

Value+3 often shifts left one, typically in earlier parts of the set. Value+1 is
common in a couple of places, as is value+0. Value+3 caps at 0x47 (73). End
numbers *may* be self-referential because they're in the same general bound as
the number of items (1c, noting that 0a and 0e are repeated and 1a is missing).

c914(12f4)            ; DATA

0d 1b 14 1b ...

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