import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import styles from "./SuccessPublish.module.css";
import SellNavbar from "../../components/Navbar/SellNavbar";
import AuthFooter from "../../components/Footer/AuthFooter";
import { publishProductWithStoredImage } from "@/services/productService";

type PublishStatus = "publishing" | "success" | "error";

function parseNumber(value: string | null, fallback: number) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return numberValue;
}
// aqui lo que se hace es definir este componente que muestra una pantalla de éxito después de que un producto ha sido publicado.
const SuccessPublish = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<PublishStatus>("publishing");
  const [errorMessage, setErrorMessage] = useState("");
  const hasPublishedRef = useRef(false);

  useEffect(() => {
    async function publishProduct() {
      if (hasPublishedRef.current) {
        return;
      }
    // aqui se verifica que el producto no se haya publicado ya, para evitar que la función se ejecute varias veces en caso de que el componente se vuelva a renderizar por alguna razón.
      hasPublishedRef.current = true;

      const name = searchParams.get("name")?.trim() ?? "";
      const brand = searchParams.get("brand")?.trim() ?? "";
      const category = searchParams.get("category")?.trim() ?? "";
      const characteristicsParam = searchParams.get("characteristics") ?? "";
      const price = parseNumber(searchParams.get("price"), 0);
      const size = searchParams.get("size")?.trim() ?? "";
      const stock = parseNumber(searchParams.get("stock"), 1);

      const characteristics = characteristicsParam
        .split(",")
        .map((characteristic) => characteristic.trim())
        .filter(Boolean);

      if (!name || !brand || !category || price <= 0) {
        setStatus("error");
        setErrorMessage("Missing required product information.");
        return;
      }
     // aqui se llama a la función publishProductWithStoredImage, que se encarga de generar la imagen del producto, subirla al Storage Bucket de Supabase y guardar el producto en la base de datos de Supabase. 
      try {
        setStatus("publishing");

        await publishProductWithStoredImage({
          name,
          brand,
          category,
          characteristics,
          price,
          size,
          stock,
        });

        setStatus("success");
      } catch (error) {
        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "The product could not be published."
        );
      }
    }

    publishProduct();
  }, [searchParams]);

  const isPublishing = status === "publishing";
  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <div className={styles.container}>
      <SellNavbar />

      <main className={styles.main}>
        {/* Imagen de éxito con el check flotante */}
        <div className={styles.imageContainer}>
          <div className={styles.successImageWrapper}>
            <img
              src="/images/characteristcs/make up 6.svg"
              alt="Success"
              className={styles.successImage}
            />
          </div>
          <div className={styles.checkIconWrapper}>
            <i
              className={
                isError
                  ? "fa-solid fa-xmark"
                  : isPublishing
                    ? "fa-solid fa-spinner"
                    : "fa-solid fa-check"
              }
            ></i>
          </div>
        </div>

        {/* Mensaje de éxito */}
        <div className={styles.messageContent}>
          <h2 className={styles.successTitle}>
            {isPublishing && "Publishing your product..."}
            {isSuccess && "Your product is now on sale!!"}
            {isError && "We could not publish your product"}
          </h2>

          <p className={styles.successDescription}>
            {isPublishing && (
              <>
                We are generating your product image, uploading it to Supabase
                Storage <br />
                and saving the product in Lumière Beauty.
              </>
            )}

            {isSuccess && (
              <>
                Your product has been published on Lumiere Beauty <br />
                and is now available for customers to find and purchase.
              </>
            )}

            {isError && (
              <>
                {errorMessage}
                <br />
                Please go back and try again.
              </>
            )}
          </p>
        </div>

        {/* Botones de acción */}
        <div className={styles.actions}>
          <Link to="/" className={styles.acceptButton}>
            Accept
          </Link>
          <Link to="/sell" className={styles.publishMoreButton}>
            Publish another product
          </Link>
        </div>

        {/* Legal Notice */}
        <hr className={styles.dividerLine} />
        <p className={styles.legalNotice}>
          By posting, you agree to{" "}
          <strong>Lumière Beauty's Terms and Conditions</strong>. See how we
          protect your privacy in our{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
          .
        </p>
      </main>

      <AuthFooter />
    </div>
  );
};

export default SuccessPublish;
