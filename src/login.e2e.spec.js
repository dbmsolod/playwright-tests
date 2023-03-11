import config from '../framework/config';

const playwright = require('playwright');
const chai = require('chai')
const expect = chai.expect

const BASE_URL = 'https://authenticationtest.com/';
const someText = 'some text';

let page, browser, context

const selectorsAuth = {
  email: 'input[type="email"]',
  password: 'input[type="password"]',
  loginBtn: 'input[class="btn btn-lg btn-primary float-right"]',
  loginSelect: 'select[id="selectLogin"]',
  selectOptionYes: 'option[value="yes"]',
  checkboxLoveManipulation: 'input[id="loveForm"]',
  loginSuccess: '.container h1',
  captchaInput: '//input[@id="captcha"]',
  captchaValue: '//label[@for="captcha"]/code',
  signInHref: '//span[contains(text(),"Please Sign In")]',
  signOutHref: '//span/a[contains(text(),"Sign Out")]'
}

const selectorsXSS = {
  searchInput: '//input[@id="search"]',
  searchBtn: '//input[@value="Search"]',
  xssText: `//div[@class="card"]/div[@class="card-body"]`
}

async function checkAuthSuccessPage() {
  const loginSuccessCaption = await page.locator(selectorsAuth.loginSuccess).textContent();
  expect(loginSuccessCaption).to.equal('Login Success');
}

async function authEmailAndPassFill(email, password) {
  await page.locator(selectorsAuth.email).fill(email);
  await page.locator(selectorsAuth.password).fill(password);
}

describe('e2e-tests for authenticationtest.com', () => {
  beforeEach(async function() {
    browser = await playwright.chromium.launch({
      headless: false,
      slowMo: 1000
    });
      
    context = await browser.newContext()
    page = await context.newPage(BASE_URL + 'complexAuth/')
  })

  afterEach(async function() {
    await page.screenshot({ path: `schreenshots/${this.currentTest.title.replace(/\s+/g, '_')}.png` })
    await browser.close()
  })

  it('Main page exists', async() => {
    await page.goto(BASE_URL);
    
    const title = await page.title()
    expect(title).to.equal('Authentication Test')
  })




  it.only('Successful authentication with select and checkbox', async() => {
    await page.goto(BASE_URL + 'complexAuth/');

    await authEmailAndPassFill(config.credentials.complexEmail, config.credentials.password);
    await page.locator(selectorsAuth.loginSelect).selectOption('yes');
    await page.locator(selectorsAuth.checkboxLoveManipulation).check();

    await page.click(selectorsAuth.loginBtn);
    await page.waitForLoadState('networkidle');

    await checkAuthSuccessPage();
  })







  it('Successful interactive authentication with captcha', async() => {
    await page.goto(BASE_URL + 'bootstrapAuth/');

    await authEmailAndPassFill(credentials.captchaEmail, credentials.password);

    const captchaValue = await page.locator(selectorsAuth.captchaValue).textContent();
    await page.locator(selectorsAuth.captchaInput).fill(captchaValue);

    await page.click(selectorsAuth.loginBtn);
    await page.waitForLoadState('networkidle');

    await checkAuthSuccessPage();
  })

  it('Sign in & Sign Out', async() => {
    await page.goto(BASE_URL + 'simpleFormAuth/');

    await authEmailAndPassFill(credentials.simpleEmail, credentials.password);
    await page.click(selectorsAuth.loginBtn);
    await page.waitForLoadState('networkidle');

    await checkAuthSuccessPage();

    await page.click(selectorsAuth.signOutHref);
    await page.waitForLoadState('networkidle');

    await page.waitForSelector(selectorsAuth.signInHref);
  })

  it('Save text in "Recent searches" block on XSS Demo page', async() => {
    await page.goto(BASE_URL + 'xssDemo/');

    await page.locator(selectorsXSS.searchInput).fill(someText);
    await page.click(selectorsXSS.searchBtn);
    await page.waitForLoadState('networkidle');

    const text = await page.locator(selectorsXSS.xssText).textContent();
    expect(text).to.contain(someText);
  })
})
