require "application_system_test_case"

class Admin::TemplatesTest < ApplicationSystemTestCase
  setup do
    @admin_template = admin_templates(:one)
  end

  test "visiting the index" do
    visit admin_templates_url
    assert_selector "h1", text: "Templates"
  end

  test "should create template" do
    visit admin_templates_url
    click_on "New template"

    fill_in "Data", with: @admin_template.data
    fill_in "Title", with: @admin_template.title
    click_on "Create Template"

    assert_text "Template was successfully created"
    click_on "Back"
  end

  test "should update Template" do
    visit admin_template_url(@admin_template)
    click_on "Edit this template", match: :first

    fill_in "Data", with: @admin_template.data
    fill_in "Title", with: @admin_template.title
    click_on "Update Template"

    assert_text "Template was successfully updated"
    click_on "Back"
  end

  test "should destroy Template" do
    visit admin_template_url(@admin_template)
    click_on "Destroy this template", match: :first

    assert_text "Template was successfully destroyed"
  end
end
