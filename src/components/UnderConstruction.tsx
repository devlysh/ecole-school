"use client";

import styled from "@emotion/styled";

const UnderConstruction = () => (
  <Main>
    {/* Header Section */}
    <MainTitle>ECOLE Language School</MainTitle>
    <Subtitle>Unlock a World of Languages Coming Soon!</Subtitle>
    <Description>
      We are busy crafting an immersive language-learning experience just for
      you!
    </Description>
    <Description>
      Our new website is currently under construction and will be launching
      soon.
    </Description>

    {/* Newsletter Subscription */}
    <SectionTitle>Want to be the first to know when we launch?</SectionTitle>
  </Main>
);

export default UnderConstruction;

const Main = styled.main`
  text-align: center;
  padding: 50px 20px;
  color: #333;
`;

const MainTitle = styled.h1`
  font-size: 48px;
  margin-bottom: 10px;
`;

const Subtitle = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
`;

const Description = styled.p`
  font-size: 18px;
  max-width: 800px;
  margin: 0 auto 30px;
  line-height: 1.6;
`;

const SectionTitle = styled.h3`
  font-size: 22px;
  margin-top: 40px;
`;
