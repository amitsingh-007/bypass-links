import { assertSchema } from "@cypress/schema-tools";
import schemas from "../../schema/extension";

describe("Extension API", () => {
  it("Assert response ", async () => {
    cy.request({
      method: "GET",
      url: "api/extension",
    }).then((response) => {
      assertSchema(schemas)("extensionApiSchema", "1.0.0")(response.body);
    });
  });
});
