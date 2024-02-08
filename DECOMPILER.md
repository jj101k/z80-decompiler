Ref https://clrhome.org/table/

Compare od -A x -t x1

Initially from ls1.tap I have 64 c3 9f b8 c3 ca be c3 4c c1 (note: previously
confused by accidentally parsing the Node compiler itself).

I have calculated the memory offset elsewhere, but I'm happy enough to do so
again here.

I'm expecting to see 3C (INC A) in any code, as well as 18 (JR), 28/20 (JR
Z/JR NZ), and rarely C3/E9 (JP, JP (HL)) and CA/C2 (JP Z/NZ). I'm also expecting them
not to be surrounded by nulls.

C2/C3/CA/E9 would be followed by a 2-byte address, and often in the same range.

So I think what I've actually got there is 64 JP b89f JP beca JP c14c JP
c1e4 - a trampoline block. That's nice but without knowing the memory
position I can't tell where to jump to. Very likely the "64" is the block
length (100 bytes), and part of the "tap" format.

Hmm.

I think the .tap files may be from a different source than the .tzx files!
Though probably both z80 - I'm thinking speccy vs. CPC.

Looking for "STERNER" - a character name - it's clear that the same content
is in there. In the .tzx, it starts at 850f; tap, 1111 (delta of 29694).

Oh okay, they do look the same then.

Right, with the new ls0.tap, we have:
RST 38h; DI; LD HL, 5b00; LD DE, 5b01; LD (HL), 00; LD BC, 0325; LDIR; XOR A;
OUT (fe), A; NOP; LD SP, 5e39; JP b1c3

I'd think that might be 01c3 relative to start-of-file, but that couldn't
possibly fit into the address space. b1c3 is 45507, so near the end of a
speccy 48kb (if that's what it is). Perhaps 51c3 is b1c3, but that would mean
load at 6000 (24KB). Hmm, that actually might make sense - clearly some code is
around b--- and clearly some code is not around 5---.

Looks like the speccy memory layout would technically allow 5b-- as RAM, and
definitely 5e--; with the stack pointer at 5e39 I can imagine that 5f00 or
6000 would be good load points, but equally it could actually all be loaded
at 5b00 in principle (just not, actually, in practice since that exact
address is in use). There's no space for a stack in the early program, so
above 5e39 would make sense. Note that 0000-5aff is all system-reserved
anyway.

End of file is at 57fb. Those last chunks look like an image (ie, probably a
map). The latest you could load that and fit at a round number is around
a700, but it just seems really unlikely that you'd load it so high.

The next stanza (bearing in mind, _probably_ code) is LD A, (b706); OR A; RET
Z; LD A, (b712); LD (5df7), A; RET; that ends at ofset +0024.

Then, CALL b0ad; CALL a211; XOR A; LD (b712), A; CALL 9d55; CALL a370; CALL
7488; XOR A; CALL 71a8; LD A, 1; LD (b712), A; LD A, (b706); OR A; JR NZ, 6;
CALL 9d55; CALL a370; CALL a474; CALL 71D7; [ending +0052; it goes on for
many more bytes].

So, while b706 and b712 seem to be in-program(?) RAM, code seems to
run at least from 71a8 to b1c3. With a 4000 range (out of 57fb!), that's
really narrowing it down. It's not completely guaranteed that b706 is
genuinely program-adjacent though - there is a natural "big RAM usage" span
that hasn't been described yet in the top 18KB or so.

I've looked at the ZX81 memory map in case that's more revealing. There, the
bottom 16KB (0000-3fff) are for ROM, 16KB (4000-7fff) for programs, 16KB
(8000-bfff) for ROM, then 16KB for display (RAM - c000-ffff). Very tight, and
clearly not the layout used here.

(I see that the speccy tape data marks 0xff as a data block marker, which
explains that first byte)

(also a checksum byte at the end)

From the Spectrum+ manual (how did I get here??), the RAM starts at 4000, the
end of the display RAM is before 5b00; system vars run
from 5c00 to 5cb6; and there are chunks above that of unclear size.
Interestingly, it seems to suggest having user graphics at the top of RAM
(looking a lot like c000 and above).

My suspicion here from cross-referencing is that it's only the 5b00-5bff low
slot that's in use, and the program may have been loaded as low as possible to
preserve upper RAM.

Looking back, I have noted that the tapes seem to be in pairs. The former here
is 0, 3, "LCODE     " f9 57 28 5e 00 80 3a; 0 being the head and 3a the tail.
It looks decently like that ending is 57f9, 5e28, 8000. 57f9 is the length of
the data, so my guess is that 5e28 is the load address. If that's the case, b1c3
is at (b1c3-5e27) +539c in the file, which happens to be:

CALL 602c; LD A, 53; CALL 676c; LD A, 6c; CALL 675e; LD A, 06; LD (5df6), A;
CALL a276; PUSH AF; ADD A, 63; LD B, A; LD A, 1; CALL b15c; POP BC; LD A,
(b15b); OR A; JR NZ, 0xdb; LD SP, 5e39; LD A, B; CP 4; JP NZ, 5e4c; CALL 7488;
JP 5e92

5e92 maps back to +6b, which is: CALL b1f7; XOR A; LD (b712), A; LD (5d36), A;
LD (5d16), A; LD HL, b711; INC (HL); CALL a2ee

Et cetera.


So the idea here is to walk the code, but: (a) when there's
an unconditional jump, follow it; (b) when there's a _conditional_
jump... well that's a more interesting case.

Don't really want to be rewinding to a bunch of arbitrary points
so nominally will follow _all_ instead. But that's kind of painful
to switch frequently.

There may also be some cases where a conditional jump is
practically unconditional (eg. jeq x, jeq y)