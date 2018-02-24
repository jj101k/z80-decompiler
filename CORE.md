Information about the core program
----------------------------------

0101                  ; DATA
5aff                  ; DATA

5b00-5b27: Up to 20 number pairs where the max second number may be meaningful. These *might* be 16-bit numbers which are ordered, but that's a bit unlikely. The first number is meaningful with 8c subtracted, so it *may* be masked with 8f, ie. it may be a single bit in the left four, and 2+2 bits in the right four. The alternative is that it may be masked to fc, making it 1+3+2+(..). It can definitely be used as a jump distance from b63a. These may be memory addresses.

5b7a                  ; DATA
5b97                  ; DATA
5b99                  ; DATA

5c0a - single bytes, unknown number but apparently more than 1.

5c50                  ; DATA

5c51-?: quad-byte values. The first 2 bytes are a 16-bit number which may be a memory base.

5cfe                  ; DATA
5cff                  ; DATA
5d00                  ; DATA

5d24-5d25: Apparent memory address

5d26                  ; DATA
5d2f                  ; DATA
5d33                  ; DATA
5d36                  ; DATA

5d37: single byte

5d3a-5d3b: possible memory address

5d3e                  ; DATA

5d47-5d48: possible memory address

5d49-5d4a: possible memory address

5d59                  ; DATA

5d62: single byte

5d8f: single byte, 1 is a valid value. May be counter suitable for b.

5d9b                  ; DATA
5dc2                  ; DATA
5dd6                  ; DATA
5dd8                  ; DATA
5df8                  ; DATA

5dfb-5dfc: Memory address (possibly 5c0a)

5dfd                  ; DATA
60af                  ; FUNCTION
6112                  ; FUNCTION
62e9                  ; FUNCTION
675e                  ; FUNCTION
6785                  ; FUNCTION
67c2                  ; FUNCTION
67df                  ; FUNCTION
67f7                  ; FUNCTION
6a8b                  ; FUNCTION
6b4a                  ; FUNCTION
6c2a                  ; FUNCTION

6daf: function, touches B or C, related to 6dde

6dde: function, touches B or C

6e74: Function, may use A, may touch a5dc or 5d3a

7091                  ; DATA
7093                  ; DATA
71d7                  ; FUNCTION

7201: Function that may use de; may touch bc and hl; sets flags

7209: Function that set flags; may use b/c and hl

726a                  ; FUNCTION
74c1                  ; FUNCTION
785d                  ; FUNCTION
78ab                  ; FUNCTION
80b1                  ; FUNCTION
830b                  ; FUNCTION
99cf                  ; FUNCTION
9d01                  ; FUNCTION

a54b-a54c: Possible memory address

a54d-a54e: Possible memory address

a550: Function that *might* set a

a578                  ; DATA
a57a                  ; FUNCTION
a5ca                  ; DATA

a5da-a5db: Possible memory address
a5dc-a5dd: Possible memory address

a5de                  ; DATA

a5e0: Function, no clear semantics but it seems to use a5de and a5dc