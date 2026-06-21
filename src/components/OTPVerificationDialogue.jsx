import { useRef } from "react";

const OTP_LENGTH = 6;

export default function OtpInput({
  length = OTP_LENGTH,
  value,
  onChange,
  onComplete,
  autoSubmit = false,
}) {
  const inputsRef = useRef([]);

  const handleChange = (val, index) => {
    if (!/^\d*$/.test(val)) return;

    const otpArray = value.split("");

    otpArray[index] = val;

    const newOtp = otpArray.join("").padEnd(length, "");

    onChange(newOtp);

    // move next
    if (val && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    const isComplete =
      newOtp.split("").filter(Boolean).length === length;

    if (isComplete && onComplete) {
      onComplete(newOtp);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          maxLength="1"
          value={value[index] || ""}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          inputMode="numeric"
          style={{
            width: "45px",
            height: "55px",
            textAlign: "center",
            fontSize: "22px",
            border: "none",
            borderBottom: "2px solid #ccc",
            outline: "none",
          }}
        />
      ))}
    </div>
  );
}