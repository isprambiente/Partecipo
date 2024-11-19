require "test_helper"

class TemplateTest < ActiveSupport::TestCase
  test "valid from factory" do
    template = build :template
    assert template.valid?
    assert template.save
  end

  ### validations
  test "title is required" do
    template = build :template, title: ""
    assert_not template.valid?
    template.title = "asdf"
    assert template.save
  end

  ### methods
  test "data= convert string in json and set data" do
    template = build :template, data: [ 1 ]
  end
end
