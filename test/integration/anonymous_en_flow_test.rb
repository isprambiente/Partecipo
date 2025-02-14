require "test_helper"
require "capybara/rails"

class AnonymousEnFlowTest < ActionDispatch::IntegrationTest
  test "can sign in" do
    get "/en/events"
    assert_dom "a", "Sign In"
  end

  test "can see events in events page" do
    event = create :event, title: "My Event"
    create :happening, event: event
    get "/en/events"
    assert_dom "h3.title", "Events"
    assert_dom "#events"
    assert_dom "span", event.title
  end

  test "can't see reserved event" do
    event = create :event, title: "My Event", reserved: true
    create :happening, event: event
    get "/en/events"
    assert_dom "#empty"
  end

  test "can see event with his details" do
    I18n.locale = :en
event = create :event, title: "My Event"
    happening = create :happening, title: "My Happening", event: event, start_at: Time.zone.now + 1.day
    get "/en/events/#{event.id}"
    assert_dom "h3.title", event.title
    # details
    assert_dom "p.heading", "From"
    assert_dom "p.title", I18n.l(event.start_on)
    assert_dom "p.heading", "To"
    assert_dom "p.title", I18n.l(event.stop_on)
    assert_dom "p.heading", "Reservation"
    assert_dom "p.title", "Free"
    assert_dom "turbo-frame#happenings"
  end

  test "can see happenings" do
    I18n.locale = :en
    event = create :event, title: "My Event"
    happening = create :happening, title: "My Happening", event: event, start_at: Time.zone.now + 1.day
    get "/en/happenings/"
    assert_dom "h3.title", "Dates"
  end

  test "can't see reserved happenings" do
    I18n.locale = :en
    event = create :event, title: "My Event", reserved: true
    happening = create :happening, title: "My Happening", event: event, start_at: Time.zone.now + 1.day
    get "/en/happenings/"
    assert_dom "#empty"
  end

  test "can see happening details" do
    I18n.locale = :en
    event = create :event, title: "My Event"
    happening = create :happening, title: "My Happening", event: event, start_at: Time.zone.now + 1.day
    get "/en/happenings/#{event.id}"
    # Event details
    assert_dom "h3.title", event.title
    assert_dom "p.heading", "From"
    assert_dom "p.title", I18n.l(event.start_on)
    assert_dom "p.heading", "To"
    assert_dom "p.title", I18n.l(event.stop_on)
    assert_dom "p.heading", "Reservation"
    assert_dom "p.title", "Free"
    # Happening details
    assert_dom "h5.title", happening.title
    assert_dom "#start-at p.title", I18n.l(happening.start_at, format: :short)
    assert_dom "#max-tickets p.title", happening.max_tickets
    assert_dom "#max-tickets-for-user p.title", happening.max_tickets_for_user
    assert_dom "#available-tickets p.title", happening.max_tickets - happening.tickets_count
  end
end
