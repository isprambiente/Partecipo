require "test_helper"

class EventsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get events_url
    assert_response :success
  end

  test "signed user should get index" do
    sign_in create(:user)
    get events_url
    assert_response :success
  end

  test "should get show " do
    event = create :event
    get event_url(event.id, locale: :it)
    assert_response :success
  end

  test "signed user should get show " do
    sign_in create(:user)
    event = create :event
    get event_url(event, locale: :it)
    assert_response :success
  end
end
