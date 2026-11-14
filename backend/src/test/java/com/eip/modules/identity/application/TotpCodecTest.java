package com.eip.modules.identity.application;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.OptionalLong;
import java.util.Random;

import org.junit.jupiter.api.Test;

/** Unit tests for {@link TotpCodec} (RFC 6238 Appendix B SHA1 vectors, truncated to 6 digits). */
class TotpCodecTest {

    private static final byte[] RFC_KEY = "12345678901234567890".getBytes(StandardCharsets.US_ASCII);
    private static final String RFC_KEY_BASE32 = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";

    @Test
    void rfcSecretEncodesToKnownBase32() {
        assertThat(TotpCodec.base32Encode(RFC_KEY)).isEqualTo(RFC_KEY_BASE32);
        assertThat(TotpCodec.base32Decode(RFC_KEY_BASE32)).isEqualTo(RFC_KEY);
    }

    @Test
    void generatesRfc6238Sha1Vectors() {
        assertThat(TotpCodec.generate(RFC_KEY, 59L / 30)).isEqualTo("287082");
        assertThat(TotpCodec.generate(RFC_KEY, 1111111109L / 30)).isEqualTo("081804");
        assertThat(TotpCodec.generate(RFC_KEY, 1111111111L / 30)).isEqualTo("050471");
        assertThat(TotpCodec.generate(RFC_KEY, 1234567890L / 30)).isEqualTo("005924");
        assertThat(TotpCodec.generate(RFC_KEY, 2000000000L / 30)).isEqualTo("279037");
    }

    @Test
    void currentStepUsesThirtySecondPeriod() {
        assertThat(TotpCodec.currentStep(Instant.ofEpochSecond(59))).isEqualTo(1);
        assertThat(TotpCodec.currentStep(Instant.ofEpochSecond(1111111111L))).isEqualTo(37037037L);
    }

    @Test
    void acceptsCurrentAndAdjacentStepsReturningMatchedStep() {
        Instant now = Instant.ofEpochSecond(1111111111L); // step 37037037
        assertThat(TotpCodec.verify(RFC_KEY_BASE32, "050471", 0, now)).hasValue(37037037L);
        // previous step (clock drift) is accepted
        assertThat(TotpCodec.verify(RFC_KEY_BASE32, "081804", 0, now)).hasValue(37037036L);
        // next step is accepted
        String next = TotpCodec.generate(RFC_KEY, 37037038L);
        assertThat(TotpCodec.verify(RFC_KEY_BASE32, next, 0, now)).hasValue(37037038L);
        // whitespace is tolerated
        assertThat(TotpCodec.verify(RFC_KEY_BASE32, "050 471", 0, now)).hasValue(37037037L);
    }

    @Test
    void rejectsCodesOutsideTheWindow() {
        Instant now = Instant.ofEpochSecond(1111111111L);
        assertThat(TotpCodec.verify(RFC_KEY_BASE32, "005924", 0, now)).isEmpty();
        String twoAhead = TotpCodec.generate(RFC_KEY, 37037039L);
        assertThat(TotpCodec.verify(RFC_KEY_BASE32, twoAhead, 0, now)).isEmpty();
    }

    @Test
    void rejectsReplayOfAnAlreadyUsedStep() {
        Instant now = Instant.ofEpochSecond(1111111111L);
        OptionalLong first = TotpCodec.verify(RFC_KEY_BASE32, "050471", 0, now);
        assertThat(first).hasValue(37037037L);
        assertThat(TotpCodec.verify(RFC_KEY_BASE32, "050471", first.getAsLong(), now)).isEmpty();
        // an older code is also rejected once a newer step was used
        assertThat(TotpCodec.verify(RFC_KEY_BASE32, "081804", 37037037L, now)).isEmpty();
    }

    @Test
    void rejectsMalformedInput() {
        Instant now = Instant.ofEpochSecond(1111111111L);
        assertThat(TotpCodec.verify(RFC_KEY_BASE32, null, 0, now)).isEmpty();
        assertThat(TotpCodec.verify(RFC_KEY_BASE32, "12345", 0, now)).isEmpty();
        assertThat(TotpCodec.verify(RFC_KEY_BASE32, "abcdef", 0, now)).isEmpty();
        assertThat(TotpCodec.verify("not*base32", "050471", 0, now)).isEmpty();
    }

    @Test
    void base32DecodeIsCaseInsensitiveAndIgnoresSpaces() {
        assertThat(TotpCodec.base32Decode("gezd gnbv gy3t qojq gezd gnbv gy3t qojq")).isEqualTo(RFC_KEY);
    }

    /** Property: decode(encode(x)) == x for arbitrary byte arrays. */
    @Test
    void base32RoundTripForRandomInputs() {
        Random random = new Random(42);
        for (int i = 0; i < 500; i++) {
            byte[] data = new byte[random.nextInt(64)];
            random.nextBytes(data);
            String encoded = TotpCodec.base32Encode(data);
            assertThat(encoded).matches("[A-Z2-7]*");
            assertThat(TotpCodec.base32Decode(encoded)).isEqualTo(data);
        }
    }

    @Test
    void newSecretIs160BitsBase32() {
        String secret = TotpCodec.newSecretBase32();
        assertThat(secret).matches("[A-Z2-7]{32}");
        assertThat(TotpCodec.base32Decode(secret)).hasSize(20);
        assertThat(TotpCodec.newSecretBase32()).isNotEqualTo(secret);
    }

    @Test
    void buildsOtpauthUriWithEncodedLabel() {
        String uri = TotpCodec.otpauthUri("EIP", "joao silva@x.com", "ABC");
        assertThat(uri).isEqualTo("otpauth://totp/EIP:joao%20silva%40x.com?secret=ABC&issuer=EIP"
                + "&algorithm=SHA1&digits=6&period=30");
    }
}
