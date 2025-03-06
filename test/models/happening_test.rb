# frozen_string_literal: true

require "test_helper"

class HappeningTest < ActiveSupport::TestCase
  test "valid from factory" do
    happening = build :happening
    assert happening.valid?
    assert happening.save
  end

  ### Relation
  test "belongs to event" do
    happening = create :happening
    assert_instance_of Event, happening.event
  end

  test "has many tickets" do
    happening = create :happening
    assert_instance_of Ticket, happening.tickets.new
  end

  test "has many ticket with countercacke" do
    happening = create :happening
    happening.tickets.create user: create(:user)
    happening.reload
    assert_equal 1, happening.tickets_count
  end

  ### Callbacks
  test "after save add end update event dates" do
    event = create :event
    assert_nil event.start_on
    assert_nil event.stop_on
    happening_1 = event.happenings.create attributes_for(:happening)
    assert_equal event.start_on, happening_1.start_at.to_date
    assert_equal event.stop_on, happening_1.start_at.to_date
    happening_2 = event.happenings.create attributes_for(:happening, start_at: Time.now + 1.month)
    assert_equal event.start_on, happening_1.start_at.to_date
    assert_equal event.stop_on, happening_2.start_at.to_date
  end

  ### Validations
  test "event is mandatory" do
    assert_not build(:happening, event: nil).valid?
  end

  test "start_at is mandatory" do
    assert_not build(:happening, start_at: nil).valid?
  end

  ### Scope
  test "default scope is ordered by date asc" do
    e1 = create :happening, start_at: Time.zone.now + 1.day
    e2 = create :happening, start_at: Time.zone.now - 1.day
    e3 = create :happening, start_at: Time.zone.now
    assert_equal e2, Happening.first
    assert_equal e1, Happening.last
  end

  test "searchable scope search from and to" do
    create :happening, start_at: Time.zone.now - 1.day
    create :happening, start_at: Time.zone.now
    create :happening, start_at: Time.zone.now + 1.days
    assert_equal 2, Happening.searchable(from: Date.today, to: Date.tomorrow).count
    assert_equal 1, Happening.searchable(from: Date.today, to: Date.today).count
    assert_equal 3, Happening.searchable(from: Date.yesterday, to: Date.tomorrow).count
  end

  test "searchable scope when from is nil use date today" do
    create :happening, start_at: Time.zone.now - 1.day
    create :happening, start_at: Time.zone.now
    create :happening, start_at: Time.zone.now + 1.days
    assert_equal 2, Happening.searchable.count
    assert_equal 2, Happening.searchable(from: nil, to: nil).count
  end

  test "searchable scope find by event id if event_id value is present" do
    e1 = create :happening
    e2 = create :happening
    e3 = create :happening, event: e2.event
    assert_equal 3, Happening.searchable.count
    assert_equal 1, Happening.searchable(event_id: e1.event_id).count
    assert_equal 2, Happening.searchable(event_id: e2.event_id).count
  end

  test "searchable scope filter by event group_id if group_id is present" do
    e1 = create :happening
    e2 = create :happening
    assert_equal 2, Happening.searchable.count
    assert_equal 2, Happening.searchable(group_id: nil).count
    assert_equal 1, Happening.searchable(group_id: e1.event.group_id).count
  end

  test "searchable scope filter ilike happening title or event title if text value is present" do
    e1 = create :event, title: "uno"
    e2 = create :event, title: "due"
    h1 = create :happening, title: "tre", event: e1
    h2 = create :happening, title: "quattro", event: e2
    assert_equal 2, Happening.searchable.count
    assert_equal 1, Happening.searchable(text: "uno").count
    assert_equal 1, Happening.searchable(text: "Quattro").count
    assert_equal 2, Happening.searchable(text: "tr").count
  end

  test "searchable scope not show happening from reserved event unless reserved options is set to true" do
    e1 = create :event
    e2 = create :event,  reserved: true
    create :happening, event: e1
    create :happening, event: e2
    assert_equal 1, Happening.searchable().count
    assert_equal 2, Happening.searchable(reserved: true).count
  end

  ### Class Method
  test "massive create" do
    event = create :event
    event.happenings.massive_create(
      from: Time.zone.now.yesterday.to_date,
      to: Time.zone.now.tomorrow.to_date,
      repeat_in: [ "0", "1", "2", "3", "4", "5", "6", "7" ],
      minutes: %w[540 720],
      start_sale_before: 2,
      stop_sale_before: 0,
      max_tickets: 100,
      max_tickets_for_user: 100
    )
    assert_equal 6, Happening.count
  end

  ### Method
  test "saleable?" do
    h = build :happening, start_at: Time.zone.now + 2.days, start_sale_at: Time.zone.now + 1.day
    assert_not h.saleable?
    h.start_sale_at = Time.zone.now
    assert h.saleable?
  end
end
