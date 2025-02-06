require "test_helper"
require 'capybara/rails'

class AnonymousFlowTest < ActionDispatch::IntegrationTest
  test "can see events as root page" do
    get "/?locale=en"
    assert_selector "h3.title", "Events"
  end
end

