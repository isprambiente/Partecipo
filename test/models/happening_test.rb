# frozen_string_literal: true

require 'test_helper'

class HappeningTest < ActiveSupport::TestCase
  test 'valid from factory' do
    assert build(:happening).valid?
  end

  ### Associations
  test 'belongs to fact' do
    f = create :fact
    h = create :happening, fact: f
    assert_equal f, h.fact
  end

  test 'has many tickets' do
    h = create :happening
    create :ticket
    create :ticket, happening: h
    assert_equal 1, h.tickets.count
  end

  test 'tickets have counter cache active' do
    h = create :happening
    create :ticket, happening: h
    create :ticket, happening: h
    assert_equal 2, h.tickets_count
  end

  ### Validations
  test 'fact is mandatory' do
    assert_not build(:happening, fact: nil).valid?
  end

  test 'start_at is mandatory' do
    assert_not build(:happening, start_at: nil).valid?
  end

  ### Scope
  test 'future scope' do
    create :happening, start_at: Time.zone.now - 1.day
    h2 = create :happening, start_at: Time.zone.now + 1.day
    h3 = create :happening, start_at: Time.zone.now + 2.days
    assert_equal 2, Happening.future.count
    assert_equal h2, Happening.future.first
    assert_equal h3, Happening.future.last
  end

  test 'history scope' do
    h1 = create :happening, start_at: Time.zone.now - 2.days
    h2 = create :happening, start_at: Time.zone.now - 1.day
    create :happening, start_at: Time.zone.now + 2.days
    assert_equal 2, Happening.history.count
    assert_equal h2, Happening.history.first
    assert_equal h1, Happening.history.last
  end

  ### method
  test 'update_seats_count! set seats_count with seats\' sum' do
    h = create :happening, max_seats_for_ticket: 3
    create :ticket, happening: h, seats: 2
    create :ticket, happening: h, seats: 3
    assert_equal 5, h.seats_count
  end

  test 'saleable?' do
    h = build :happening, start_at: Time.zone.now + 2.days, start_sale_at: Time.zone.now + 1.day
    assert_not h.saleable?
    h.start_sale_at = Time.zone.now
    assert h.saleable?
  end
end
