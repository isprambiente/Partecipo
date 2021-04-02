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
    h = create :happening, stop_sale_at: Time.zone.now - 1.day
    assert_not build(:ticket, happening: h).valid?
  end

  test 'can`t be exceed max_seat' do
    h = create :happening, max_seats: 5, max_seats_for_ticket: 5
    create :ticket, happening: h, seats: 4
    assert_not build(:ticket, happening: h, seats: 2).valid?
  end

  test 'tickets_frequency on :any' do
    ticket1 = create :ticket
    ticket2 = build :ticket, happening: ticket1.happening
    assert ticket2.valid?
    assert ticket2.save
  end

  test 'tickets_frequency on single' do
    fact = create :fact, tickets_frequency: :single
    h1 = create :happening, fact: fact
    h2 = create :happening, fact: fact, start_at: Time.zone.now + 2.day
    t1 = create :ticket, happening: h1
    t2 = build :ticket, happening: h2, user: t1.user
    assert_not t2.valid?
    assert_not t2.save
  end

  test 'tickets_frequency on daily' do
    fact = create :fact, tickets_frequency: :daily
    h1 = create :happening, fact: fact
    h2 = create :happening, fact: fact
    h3 = create :happening, fact: fact, start_at: Time.zone.now + 2.day
    t1 = create :ticket, happening: h1
    t2 = build :ticket, happening: h2, user: t1.user
    assert_not t2.valid?
    assert_not t2.save
    t3 = build :ticket, happening: h3, user: t1.user
    assert t3.valid?
    assert t3.save
  end

  test 'tickets_frequency on weekly' do
    fact = create :fact, tickets_frequency: :weekly
    h1 = create :happening, fact: fact
    h2 = create :happening, fact: fact, start_at: Time.zone.now + 6.day
    h3 = create :happening, fact: fact, start_at: Time.zone.now + 8.day
    t1 = create :ticket, happening: h1
    t2 = build :ticket, happening: h2, user: t1.user
    assert_not t2.valid?
    assert_not t2.save
    t3 = build :ticket, happening: h3, user: t1.user
    assert t3.valid?
    assert t3.save
  end

  test 'tickets_frequency on monthly' do
    fact = create :fact, tickets_frequency: :monthly
    h1 = create :happening, fact: fact
    h2 = create :happening, fact: fact, start_at: Time.zone.now + 29.day
    h3 = create :happening, fact: fact, start_at: Time.zone.now + 31.day
    t1 = create :ticket, happening: h1
    t2 = build :ticket, happening: h2, user: t1.user
    assert_not t2.valid?
    assert_not t2.save
    t3 = build :ticket, happening: h3, user: t1.user
    assert t3.valid?
    assert t3.save
  end
end
