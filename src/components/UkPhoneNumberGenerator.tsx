import { useState } from "react";
import styles from "./UkPhoneNumberGenerator.module.css";

const FICTIONAL_NUMBER_PREFIX = "01617 15";

function generatePhoneNumber() {
  const suffix = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `${FICTIONAL_NUMBER_PREFIX}${suffix}`;
}

export default function UkPhoneNumberGenerator() {
  const [phoneNumber, setPhoneNumber] = useState(generatePhoneNumber());
  const [copied, setCopied] = useState(false);

  function generate() {
    setPhoneNumber(generatePhoneNumber());
    setCopied(false);
  }

  async function copy() {
    await navigator.clipboard.writeText(phoneNumber.replace(/\s/g, ""));
    setCopied(true);
  }

  return (
    <section
      className={styles.generator}
      aria-labelledby="phone-generator-title"
    >
      <h3 id="phone-generator-title">Example UK phone number</h3>
      <output className={styles.number} aria-live="polite">
        {phoneNumber}
      </output>
      <div className={styles.actions}>
        <button type="button" onClick={generate}>
          Generate
        </button>
        <button type="button" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p>
        For formatting reference only. This is in an unallocated phone number
        range. Do not use this where accurate or verifiable contact information
        is required.
      </p>
    </section>
  );
}
