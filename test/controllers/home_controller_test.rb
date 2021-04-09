require "test_helper"

class HomeControllerTest < ActionDispatch::IntegrationTest
  test "should get top_menu" do
    get home_top_menu_url
    assert_response :success
  end
end
