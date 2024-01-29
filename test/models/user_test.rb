# frozen_string_literal: true

require "test_helper"

# Test {User model}
class UserTest < ActiveSupport::TestCase
  test "valid from factory" do
    user = build :user
    assert user.valid?
    assert user.save
  end

  ### Relations
  test "has many groups" do
    user = create :user
    assert_instance_of Group, user.groups.new
  end

  test "has many tickets" do
    user = create :user
    assert_instance_of Ticket, user.tickets.new
  end

  # test 'has many events' do
  #  user = create :user
  #  assert_instance_of Event, user.events.new
  # end

  ### validations
  test "email is required and well formatted" do
    user = build :user, email: nil
    assert_not user.valid?
    user.email = "test"
    assert_not user.valid?
    user.email = "test@tost.it"
    assert user.valid?
    assert user.save
  end
end
