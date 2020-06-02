# frozen_string_literal: true

require 'test_helper'

class TicketTest < ActiveSupport::TestCase
  test 'Valid from factory' do
    assert build(:ticket).valid?
  end

  ### Associations
  test 'belongs to user' do
    u = create :user
    t = create :ticket, user: u
    assert_equal u, t.user
  end

  test 'belongs to happening' do
    h = create :happening
    t = create :ticket, happening: h
    assert_equal h, t.happening
  end

  ### Validations
  # test 'happening is mandatory' do
  #  assert_not build(:ticket, happening: nil).valid?
  # end

  test 'user is mandatory' do
    assert_not build(:ticket, user: nil).valid?
  end

  test 'seats is mandatory' do
    assert_not build(:ticket, seats: nil).valid?
  end

  test 'seats must be less or equal to mas_seat_for_ticket' do
    assert_not build(:ticket, seats: 2).valid?
  end

  test 'if :by_editor == true max_seats arent validate' do
    assert build(:ticket, seats: 2, by_editor: true).valid?
  end

  test 'can`t sell after stop_sale_at' do
    h = create :happening, stop_sale_at: Time.zone.nowg - 1.day
    assert_not build(:ticket, happening: h).valid?
  end

  test 'can`t be exceed max_seat' do
    h = create :happening, max_seats: 5, max_seats_for_ticket: 5
    create :ticket, happening: h, seats: 4
    assert_not build(:ticket, happening: h, seats: 2).valid?
  end
end
