import { useEffect, useState } from "react";
import { code128 } from "bwip-js/browser";
import styles from "./BarcodeGenerator.module.css";

const CLUBCARD_DIGITS_REQUIRED = 13;
const CLUBCARD_STORAGE_KEY = "appless-clubcard-number";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export default function BarcodeGenerator() {
  const [value, setValue] = useState("");
  const [barcodeImage, setBarcodeImage] = useState("");
  const [error, setError] = useState("");
  const remainingDigits = CLUBCARD_DIGITS_REQUIRED - value.length;
  const isIncomplete = remainingDigits > 0;

  useEffect(() => {
    try {
      const savedValue = localStorage.getItem(CLUBCARD_STORAGE_KEY);

      if (savedValue) {
        setValue(savedValue.replace(/\D/g, ""));
      }
    } catch {
      // The form still works when browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    if (value.length < CLUBCARD_DIGITS_REQUIRED) {
      setBarcodeImage("");
      setError("");
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      const barcodeValue = `979${value.slice(-CLUBCARD_DIGITS_REQUIRED)}`;

      code128(canvas, {
        bcid: "code128",
        text: barcodeValue,
        scale: 2,
        height: 22,
        includetext: false,
        paddingwidth: 0,
        paddingheight: 0,
        backgroundcolor: "FFFFFF",
        barcolor: "000000",
      });

      setBarcodeImage(canvas.toDataURL("image/png"));
      setError("");
    } catch (generationError) {
      setBarcodeImage("");
      setError(getErrorMessage(generationError));
    }
  }, [value]);

  function updateValue(nextValue: string) {
    const sanitisedValue = nextValue.replace(/\D/g, "");

    setValue(sanitisedValue);

    try {
      if (sanitisedValue) {
        localStorage.setItem(CLUBCARD_STORAGE_KEY, sanitisedValue);
      } else {
        localStorage.removeItem(CLUBCARD_STORAGE_KEY);
      }
    } catch {
      // The form still works when browser storage is unavailable.
    }
  }

  function formatclubcardNumber(number: string) {
    if (number.length <= 6) {
      return number;
    }

    return `${number.slice(0, 6)} ${number.slice(6).match(/.{1,4}/g)?.join(" ") ?? ""}`;
  }

  return (
    <section className={styles.screen} aria-labelledby="clubcard-title">
      <header className={styles.header}>
        <a className={styles.back} href="/help" aria-label="Back to help"></a>
        <h1 id="clubcard-title">Your Clubcard</h1>
      </header>

      <div className={styles.content}>
        <article className={styles.card}>
          <div className={styles.barcode}>
            {barcodeImage && (
              <img src={barcodeImage} alt="Your Clubcard barcode" />
            )}
            {isIncomplete && (
              <p
                className={styles.incomplete}
                id="clubcard-incomplete"
                aria-live="polite"
              >
                Your barcode will appear here.
              </p>
            )}
          </div>

          <label className={styles.visuallyHidden} htmlFor="clubcard-number">
            clubcard number
          </label>
          <input
            className={styles.number}
            id="clubcard-number"
            name="clubcard-number"
            type="text"
            value={formatclubcardNumber(value)}
            onChange={(event) => updateValue(event.target.value)}
            placeholder="Tap here to enter clubcard number"
            inputMode="numeric"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            aria-describedby={
              [isIncomplete && "clubcard-incomplete", error && "clubcard-error"]
                .filter(Boolean)
                .join(" ") || undefined
            }
          />

          {error && (
            <p className={styles.error} id="clubcard-error" role="alert">
              {error}
            </p>
          )}

          <div className={styles.scanCopy}>
            <strong>Scan at the till</strong>
            <span>To collect clubcard points</span>
          </div>
        </article>

        <div className={styles.controls} aria-hidden="true">
          <span className={styles.dotOutline}></span>
          <span className={styles.dotFilled}></span>
        </div>
      </div>
    </section>
  );
}
