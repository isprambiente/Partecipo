# frozen_string_literal: true

require "test_helper"

# test fot {Event} model
class EventTest < ActiveSupport::TestCase
  test "valid from factory" do
    event = build :event
    assert event.valid?
    assert event.save
  end

  ### Relations
  test "belongs to group" do
    event = create :event
    assert_instance_of Group, event.group
  end

  test "has_many happenings" do
    event = create :event
    assert_instance_of Happening, event.happenings.new
  end

  ### Validonions
  test "title are required" do
    assert_not build(:event, title: nil).valid?
  end

  ### scope
  # test "with_date" do
  #   create :event
  #  create :event, start_on: Date.today, stop_on: Date.today
  #  assert_equal 2, Event.count
  #  assert_equal 1, Event.with_date.count
  # end
  # test 'future scope' do
  #  create :event, start_on: Time.zone.today - 2.days, stop_on: Time.zone.today - 1.day
  #  f2 = create :event, start_on: Time.zone.today - 1.day, stop_on: Time.zone.today + 1.day
  #  f3 = create :event, start_on: Time.zone.today + 2.days, stop_on: Time.zone.today + 3.days
  #  create :event, start_on: Time.zone.today - 4.days, stop_on: Time.zone.today - 3.days

  #  assert_equal 2, Event.future.count
  #  assert_equal f2, Event.future.first
  #  assert_equal f3, Event.future.last
  # end
  # test 'history scope' do
  #  f1 = create :event, start_on: Time.zone.today - 2.days, stop_on: Time.zone.today - 1.day
  #  create :event, start_on: Time.zone.today - 1.day, stop_on: Time.zone.today + 1.day
  #  create :event, start_on: Time.zone.today + 2.days, stop_on: Time.zone.today + 3.days
  # end
end
