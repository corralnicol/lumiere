import Header from "../../components/Header/Header";
import Hero from "../../components/Hero/Hero";
import Categories from "../../components/Categories/Categories";
import BestSellers from "../../components/BestSellers/BestSellers";
import Footer from "../../components/Footer/Footer";

function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Categories />
        <BestSellers />
      </main>
      <Footer />
    </>
  );
}

export default Home;