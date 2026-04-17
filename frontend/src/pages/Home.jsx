import Hero from "../components/Hero/Hero"
import MainExplore from "../components/MainExplore/MainExplore"
import MainProjects from "../components/MainProjects/MainProjects"
import MainAbout from "../components/MainAbout/MainAbout"
import MainInfo from "../components/MainInfo/MainInfo"
import MainPartners from "../components/MainPartners/MainPartners"
import MainCareer from "../components/MainCareer/MainCareer"
const Home = () => {


  return (
    <div>
      <Hero />
      <MainExplore />
      <MainInfo />
      <MainAbout />
      <MainProjects />
      <MainPartners />
      <MainCareer />
    </div>
  );
};

export default Home;
