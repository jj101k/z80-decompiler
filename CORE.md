ROM
---

0101                  ; DATA

1b0d-3d14: Possible data of various possible sizes, min 0.

Information about the core program
----------------------------------

5aff                  ; DATA

5b00-5b95: Up to 20 words where the max second byte may be meaningful. These *might* be 16-bit numbers which are ordered, but that's a bit unlikely. The first number is meaningful with 8c subtracted, so it *may* be masked with 8f, ie. it may be a single bit in the left four, and 2+2 bits in the right four. The alternative is that it may be masked to fc, making it 1+3+2+(..). It can definitely be used as a jump distance from b63a.

0 is a valid value for 5b00.

Also (at 5b01)... 50 3-byte values where the first byte is some kind of identifier. This is initialised with all "ff".

Also 5b01-5b02 may be a memory offset.

It's likely that this is convenient multipurpose memory.

5b7a                  ; DATA
5b97                  ; DATA

5b99-?: triple-byte values where the first is an 8c offset or ff; and the second may be ff.

5c0a-5c3c - single bytes, 50x, ff is valid

5c50                  ; DATA

5c51-?: quad-byte values. The first 2 bytes are a 16-bit number which may be a memory base.

5cf0-5cf9: A set of single-byte identifiers from 5b01

5cfe                  ; DATA
5cff                  ; DATA
5d00                  ; DATA

5d24-5d25: Apparent memory address

5d26 - byte, may be ff or 8c+n
5d2f                  ; DATA
5d33                  ; DATA
5d36                  ; DATA

5d37: single byte

5d3a-5d3b: possible memory address, may be identical to 5b00-5b01; 5d3a and 5d3b may also contain single bytes which may be map coordinates.

5d3e                  ; DATA

5d47-5d48: possible memory address

5d49-5d4a: possible memory address

5d59                  ; DATA

5d62: single byte

5d8f: single byte, 1 is a valid value. May be counter suitable for b.

5d9b                  ; DATA
5dc2                  ; DATA
5dd6: possible memory address
5dd8: possible memory address
5df8: single byte

5dfb-5dfc: Memory address (possibly 5c0a or 5b00), refers to triple-byte chunk with at least 8 entries

5dfd                  ; DATA
60af                  ; FUNCTION
6112                  ; FUNCTION
62e9                  ; FUNCTION
675e                  ; FUNCTION
6785                  ; FUNCTION
67c2                  ; FUNCTION
67df                  ; FUNCTION
67f7: Function, apparently uses A
6a8b                  ; FUNCTION
6b4a                  ; FUNCTION
6c2a                  ; FUNCTION

6c72: function, may use A

6daf: function, touches B or C, related to 6dde

6dde: function, touches B or C; may set up memory or other registers. It seems that this is "rotate towards direction A", presumably including AP charge.

6e74: Function, reads A (0-7); may read 5d3a and a5dc; modifies 5d3a, a5dc and A (zero or nonzero value). This appears to be "find coordinates 1 step in direction A" given context (5d3a, a5dc), one of which presumably identifies the start position.

6ebf: Function

7042: function? This is a direct jump target, but only where the next instruction is RET.

7091: possible memory address
7093: possible memory address
71d7                  ; FUNCTION

7201: Function that may use de; may touch bc and hl; sets flags

7209: Function that set flags; may use b/c and hl

726a: Function that may use HL; may store 5b97, may read 5d24. Looks like this is a memory setter of some kind.

7326: function, may set A

74c1                  ; FUNCTION
785d                  ; FUNCTION
78ab                  ; FUNCTION

7f0b: Function, may write to 5d37

80b1                  ; FUNCTION
830b                  ; FUNCTION
99cf                  ; FUNCTION
9a16: function - sets Z?
9d01                  ; FUNCTION

a54b-a54c: Possible memory address

a54d-a54e: Possible memory address

a550: Function that *might* set A, almost certainly reads a54d

a578-a579: Memory address, may be 5b00
a57a                  ; FUNCTION
a5ca                  ; DATA

a5da-a5db: Possible memory address
a5dc-a5dd: Possible memory address

a5de: Memory address, may be a5dc

a5e0: Function, no clear semantics but it seems to use a5de and a5dc