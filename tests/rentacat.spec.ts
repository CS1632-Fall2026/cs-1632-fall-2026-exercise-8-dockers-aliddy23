import { test, expect, Page } from "@playwright/test";

const appUrl = "http://localhost:8080";

async function setCatCookies(page: Page, values: Record<"1" | "2" | "3", boolean>) {
	await page.evaluate((cookieValues) => {
		document.cookie = `1=${cookieValues["1"]}`;
		document.cookie = `2=${cookieValues["2"]}`;
		document.cookie = `3=${cookieValues["3"]}`;
	}, values);
}

function catNames(page: Page) {
	return page.getByRole("list", { name: "Cat names" }).getByRole("listitem");
}

async function expectCatNames(page: Page, expected: string[]) {
	await expect(catNames(page)).toHaveText(expected);
}

test.beforeEach(async ({ page }) => {
	await page.goto(appUrl);
	await setCatCookies(page, { "1": false, "2": false, "3": false });
	await page.reload();
});

test("TEST-1-RESET", async ({ page }) => {
	await setCatCookies(page, { "1": true, "2": true, "3": true });
	await page.reload();

	await page.getByRole("link", { name: "Reset" }).click();

	await expectCatNames(page, ["ID 1. Jennyanydots", "ID 2. Old Deuteronomy", "ID 3. Mistoffelees"]);
});

test("TEST-2-CATALOG", async ({ page }) => {
	await page.getByRole("link", { name: "Catalog" }).click();

	const secondCatPhoto = page.getByRole("list", { name: "Cat photos" }).getByRole("listitem").nth(1).locator("img");

	await expect(secondCatPhoto).toHaveAttribute("src", "/images/cat2.jpg");
});

test("TEST-3-LISTING", async ({ page }) => {
	await page.getByRole("link", { name: "Catalog" }).click();

	await expect(catNames(page)).toHaveCount(3);
	await expect(catNames(page).nth(2)).toHaveText("ID 3. Mistoffelees");
});

test("TEST-4-RENT-A-CAT", async ({ page }) => {
	await page.getByRole("link", { name: "Rent-A-Cat" }).click();

	await expect(page.getByRole("button", { name: "Rent" })).toBeVisible();
	await expect(page.getByRole("button", { name: "Return" })).toBeVisible();
});

test("TEST-5-RENT", async ({ page }) => {
	await page.getByRole("link", { name: "Rent-A-Cat" }).click();
	await page.getByLabel("Enter the ID of the cat to rent:").fill("1");
	await page.getByRole("button", { name: "Rent" }).click();

	await expectCatNames(page, ["Rented out", "ID 2. Old Deuteronomy", "ID 3. Mistoffelees"]);
	await expect(page.getByText("Success!", { exact: true })).toBeVisible();
});

test("TEST-6-RETURN", async ({ page }) => {
	await setCatCookies(page, { "1": false, "2": true, "3": true });
	await page.getByRole("link", { name: "Rent-A-Cat" }).click();
	await page.getByLabel("Enter the ID of the cat to return:").fill("2");
	await page.getByRole("button", { name: "Return" }).click();

	await expectCatNames(page, ["ID 1. Jennyanydots", "ID 2. Old Deuteronomy", "Rented out"]);
	await expect(page.getByText("Success!", { exact: true })).toBeVisible();
});

test("TEST-7-FEED-A-CAT", async ({ page }) => {
	await page.getByRole("link", { name: "Feed-A-Cat" }).click();

	await expect(page.getByRole("button", { name: "Feed" })).toBeVisible();
});

test("TEST-8-FEED", async ({ page }) => {
	await page.getByRole("link", { name: "Feed-A-Cat" }).click();
	await page.getByLabel("Number of catnips to feed:").fill("6");
	await page.getByRole("button", { name: "Feed" }).click();

	await expect(page.getByText("Nom, nom, nom.", { exact: true })).toBeVisible({
		timeout: 10000,
	});
});

test("TEST-9-GREET-A-CAT", async ({ page }) => {
	await page.getByRole("link", { name: "Greet-A-Cat" }).click();

	await expect(page.getByText("Meow!Meow!Meow!", { exact: true })).toBeVisible();
});

test("TEST-10-GREET-A-CAT-WITH-NAME", async ({ page }) => {
	await page.goto(`${appUrl}/greet-a-cat/Jennyanydots`);

	await expect(page.getByText("Meow! from Jennyanydots.", { exact: true })).toBeVisible();
});

test("TEST-11-FEED-A-CAT-SCREENSHOT", async ({ page }) => {
	await setCatCookies(page, { "1": true, "2": true, "3": true });
	await page.getByRole("link", { name: "Feed-A-Cat" }).click();

	await expect(page.locator("body")).toHaveScreenshot();
});
