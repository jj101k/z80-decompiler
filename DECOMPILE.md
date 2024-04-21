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