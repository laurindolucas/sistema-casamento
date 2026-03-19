import pygame
import sys
import random
import math

pygame.init()
pygame.mixer.init()

# --- Configurações ---
WIDTH, HEIGHT = 900, 600
FPS = 60
TILE = 48
GRAVITY = 0.6
JUMP_FORCE = -14
PLAYER_SPEED = 5

WHITE   = (255, 255, 255)
BLACK   = (0,   0,   0)
RED     = (220,  50,  50)
BLUE    = ( 70, 130, 200)
GREEN   = ( 60, 160,  60)
YELLOW  = (255, 220,  30)
BROWN   = (139,  90,  43)
ORANGE  = (230, 130,  30)
SKY     = ( 95, 175, 255)
DARKSKY = ( 40, 100, 200)
GROUND  = ( 80, 190,  80)
DIRT    = (150, 100,  50)
BRICK   = (180,  80,  40)
COINC   = (255, 200,   0)
MUSHC   = (255,  60,  60)
FLAGC   = (240, 240, 240)
DARK    = ( 30,  30,  30)
PURPLE  = (140,  60, 200)

screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("🍄 Super PyMario")
clock = pygame.time.Clock()

font_big   = pygame.font.SysFont("Arial", 48, bold=True)
font_med   = pygame.font.SysFont("Arial", 28, bold=True)
font_small = pygame.font.SysFont("Arial", 20)

# ─── Helpers de desenho ───────────────────────────────────────────────────────

def draw_rect_outline(surf, color, rect, radius=6, width=3):
    pygame.draw.rect(surf, color, rect, width, border_radius=radius)

def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

# ─── Partículas ──────────────────────────────────────────────────────────────

class Particle:
    def __init__(self, x, y, color, vx=None, vy=None, life=30):
        self.x, self.y = x, y
        self.color = color
        self.vx = vx if vx is not None else random.uniform(-3, 3)
        self.vy = vy if vy is not None else random.uniform(-5, -1)
        self.life = life
        self.max_life = life

    def update(self):
        self.x += self.vx
        self.vy += 0.2
        self.y += self.vy
        self.life -= 1

    def draw(self, surf, cam_x):
        alpha = self.life / self.max_life
        r = max(1, int(5 * alpha))
        color = lerp_color(self.color, WHITE, 1 - alpha)
        pygame.draw.circle(surf, color, (int(self.x - cam_x), int(self.y)), r)

particles = []

def spawn_particles(x, y, color, n=8):
    for _ in range(n):
        particles.append(Particle(x, y, color))

# ─── Tiles / Plataformas ─────────────────────────────────────────────────────

class Platform:
    def __init__(self, x, y, w, h, kind="ground"):
        self.rect = pygame.Rect(x, y, w, h)
        self.kind = kind  # ground / brick / pipe / castle

    def draw(self, surf, cam_x):
        rx = self.rect.x - cam_x
        r = pygame.Rect(rx, self.rect.y, self.rect.w, self.rect.h)
        if self.kind == "ground":
            pygame.draw.rect(surf, GREEN,  r)
            pygame.draw.rect(surf, DIRT,   pygame.Rect(rx, self.rect.y+TILE//4, self.rect.w, self.rect.h-TILE//4))
            pygame.draw.rect(surf, BLACK,  r, 2, border_radius=2)
        elif self.kind == "brick":
            pygame.draw.rect(surf, BRICK, r)
            # grade de tijolos
            for bx in range(r.x, r.x+r.w, 24):
                pygame.draw.line(surf, DARK, (bx, r.y), (bx, r.y+r.h), 1)
            pygame.draw.line(surf, DARK, (r.x, r.y+r.h//2), (r.x+r.w, r.y+r.h//2), 1)
            pygame.draw.rect(surf, BLACK, r, 2)
        elif self.kind == "pipe":
            pygame.draw.rect(surf, (30, 160, 30), r)
            pygame.draw.rect(surf, (10, 120, 10), pygame.Rect(rx, self.rect.y, TILE//5, self.rect.h))
            cap = pygame.Rect(rx - 4, self.rect.y, self.rect.w + 8, TILE // 2)
            pygame.draw.rect(surf, (40, 180, 40), cap, border_radius=4)
            pygame.draw.rect(surf, BLACK, r, 2)
            pygame.draw.rect(surf, BLACK, cap, 2, border_radius=4)

# ─── Bloco com item (?) ──────────────────────────────────────────────────────

class QuestionBlock:
    def __init__(self, x, y, item="coin"):
        self.rect = pygame.Rect(x, y, TILE, TILE)
        self.item = item
        self.hit = False
        self.anim = 0

    def bump(self):
        if not self.hit:
            self.hit = True
            self.anim = 10
            return self.item
        return None

    def update(self):
        if self.anim > 0:
            self.anim -= 1

    def draw(self, surf, cam_x):
        rx = self.rect.x - cam_x
        r = pygame.Rect(rx, self.rect.y - (self.anim * 2), self.rect.w, self.rect.h)
        color = (180, 180, 60) if self.hit else YELLOW
        pygame.draw.rect(surf, color, r, border_radius=4)
        pygame.draw.rect(surf, BLACK, r, 2, border_radius=4)
        ch = "·" if self.hit else "?"
        t = font_med.render(ch, True, BLACK if self.hit else BROWN)
        surf.blit(t, (r.centerx - t.get_width()//2, r.centery - t.get_height()//2))

# ─── Moeda ────────────────────────────────────────────────────────────────────

class Coin:
    def __init__(self, x, y):
        self.rect = pygame.Rect(x, y, 24, 24)
        self.collected = False
        self.t = 0

    def update(self):
        self.t += 0.1

    def draw(self, surf, cam_x):
        if self.collected: return
        rx = self.rect.centerx - cam_x
        ry = self.rect.centery + int(math.sin(self.t) * 4)
        pygame.draw.circle(surf, COINC, (rx, ry), 10)
        pygame.draw.circle(surf, YELLOW, (rx, ry), 7)
        pygame.draw.circle(surf, BLACK, (rx, ry), 10, 2)

# ─── Inimigo (Goomba-like) ────────────────────────────────────────────────────

class Enemy:
    def __init__(self, x, y, patrol_left, patrol_right):
        self.rect = pygame.Rect(x, y, 36, 36)
        self.vx = -1.5
        self.vy = 0
        self.dead = False
        self.dead_timer = 0
        self.patrol_left = patrol_left
        self.patrol_right = patrol_right
        self.t = 0

    def update(self, platforms):
        if self.dead:
            self.dead_timer -= 1
            return
        self.t += 0.15
        self.rect.x += int(self.vx)
        if self.rect.left < self.patrol_left or self.rect.right > self.patrol_right:
            self.vx *= -1
        self.vy += GRAVITY
        self.rect.y += int(self.vy)
        for p in platforms:
            if self.rect.colliderect(p.rect):
                if self.vy > 0:
                    self.rect.bottom = p.rect.top
                    self.vy = 0

    def stomp(self):
        self.dead = True
        self.dead_timer = 30
        spawn_particles(self.rect.centerx, self.rect.centery, ORANGE)

    def draw(self, surf, cam_x):
        if self.dead:
            rx = self.rect.x - cam_x
            flat = pygame.Rect(rx, self.rect.y + self.rect.h - 10, self.rect.w, 10)
            pygame.draw.rect(surf, BROWN, flat, border_radius=3)
            return
        rx = self.rect.x - cam_x
        # corpo
        body = pygame.Rect(rx, self.rect.y, self.rect.w, self.rect.h)
        pygame.draw.ellipse(surf, BROWN, body)
        # cabeça maior
        head = pygame.Rect(rx - 4, self.rect.y - 8, self.rect.w + 8, 28)
        pygame.draw.ellipse(surf, (160, 100, 50), head)
        # olhos
        eye_offset = int(math.sin(self.t) * 1)
        pygame.draw.circle(surf, WHITE, (rx + 9,  self.rect.y - 2 + eye_offset), 5)
        pygame.draw.circle(surf, WHITE, (rx + 27, self.rect.y - 2 + eye_offset), 5)
        pygame.draw.circle(surf, BLACK, (rx + 10, self.rect.y - 1 + eye_offset), 3)
        pygame.draw.circle(surf, BLACK, (rx + 28, self.rect.y - 1 + eye_offset), 3)
        # pés animados
        foot = int(abs(math.sin(self.t)) * 4)
        pygame.draw.ellipse(surf, DARK, pygame.Rect(rx,      self.rect.bottom - 8 + foot, 16, 10))
        pygame.draw.ellipse(surf, DARK, pygame.Rect(rx + 20, self.rect.bottom - 8 - foot, 16, 10))

# ─── Bandeira (objetivo) ──────────────────────────────────────────────────────

class Flag:
    def __init__(self, x, y):
        self.x, self.y = x, y
        self.rect = pygame.Rect(x, y - 160, 16, 160)
        self.flag_rect = pygame.Rect(x + 16, y - 160, 40, 28)

    def draw(self, surf, cam_x):
        rx = self.x - cam_x
        pygame.draw.rect(surf, (180, 180, 180), (rx, self.y - 160, 8, 160))
        pygame.draw.rect(surf, GREEN, (rx + 8, self.y - 160, 50, 30))
        pygame.draw.polygon(surf, WHITE, [(rx+8, self.y-160),(rx+8, self.y-132),(rx+58, self.y-146)])
        pygame.draw.circle(surf, YELLOW, (rx + 4, self.y - 162), 8)

# ─── Jogador ──────────────────────────────────────────────────────────────────

class Player:
    def __init__(self, x, y):
        self.rect = pygame.Rect(x, y, 36, 48)
        self.vx, self.vy = 0, 0
        self.on_ground = False
        self.facing = 1
        self.t = 0
        self.alive = True
        self.win = False
        self.coins = 0
        self.lives = 3
        self.invincible = 0
        self.big = False

    def handle_input(self, keys):
        self.vx = 0
        if keys[pygame.K_LEFT]  or keys[pygame.K_a]: self.vx = -PLAYER_SPEED; self.facing = -1
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]: self.vx =  PLAYER_SPEED; self.facing =  1
        if (keys[pygame.K_UP] or keys[pygame.K_w] or keys[pygame.K_SPACE]) and self.on_ground:
            self.vy = JUMP_FORCE
            self.on_ground = False
            spawn_particles(self.rect.centerx, self.rect.bottom, WHITE, 5)

    def update(self, platforms, q_blocks, coins, enemies, flag):
        if not self.alive: return
        self.t += 0.15
        if self.invincible > 0: self.invincible -= 1

        self.vy += GRAVITY
        self.rect.x += int(self.vx)
        self._collide_x(platforms)
        self.rect.y += int(self.vy)
        self.on_ground = False
        self._collide_y(platforms, q_blocks)

        # Coletar moedas
        for c in coins:
            if not c.collected and self.rect.colliderect(c.rect):
                c.collected = True
                self.coins += 1
                spawn_particles(c.rect.centerx, c.rect.centery, COINC, 6)

        # Inimigos
        if self.invincible == 0:
            for e in enemies:
                if e.dead: continue
                if self.rect.colliderect(e.rect):
                    if self.vy > 0 and self.rect.bottom < e.rect.centery + 10:
                        e.stomp()
                        self.vy = JUMP_FORCE * 0.6
                    else:
                        self.die()

        # Cair no buraco
        if self.rect.top > HEIGHT + 50:
            self.die()

        # Bandeira
        if self.rect.colliderect(flag.rect):
            self.win = True

    def _collide_x(self, platforms):
        for p in platforms:
            if self.rect.colliderect(p.rect):
                if self.vx > 0: self.rect.right = p.rect.left
                elif self.vx < 0: self.rect.left = p.rect.right

    def _collide_y(self, platforms, q_blocks):
        for p in platforms:
            if self.rect.colliderect(p.rect):
                if self.vy > 0:
                    self.rect.bottom = p.rect.top
                    self.vy = 0
                    self.on_ground = True
                elif self.vy < 0:
                    self.rect.top = p.rect.bottom
                    self.vy = 0
        for qb in q_blocks:
            if self.rect.colliderect(qb.rect):
                if self.vy < 0:
                    self.rect.top = qb.rect.bottom
                    self.vy = 0
                    item = qb.bump()
                    if item == "coin":
                        self.coins += 1
                        spawn_particles(qb.rect.centerx, qb.rect.top, COINC, 8)

    def die(self):
        if self.invincible > 0: return
        self.lives -= 1
        spawn_particles(self.rect.centerx, self.rect.centery, RED, 12)
        if self.lives <= 0:
            self.alive = False
        else:
            self.rect.topleft = (100, 300)
            self.vy = JUMP_FORCE
            self.invincible = 90

    def draw(self, surf, cam_x):
        if not self.alive: return
        if self.invincible > 0 and (self.invincible // 5) % 2 == 0: return
        rx = self.rect.x - cam_x
        h = self.rect.h

        # corpo (macacão azul)
        body = pygame.Rect(rx + 4, self.rect.y + h//2, self.rect.w - 8, h//2)
        pygame.draw.rect(surf, BLUE, body, border_radius=4)

        # camisa (vermelha)
        shirt = pygame.Rect(rx + 2, self.rect.y + h//3, self.rect.w - 4, h//4)
        pygame.draw.rect(surf, RED, shirt, border_radius=3)

        # cabeça
        head = pygame.Rect(rx + 2, self.rect.y, self.rect.w - 4, h//2 + 4)
        pygame.draw.rect(surf, (255, 200, 140), head, border_radius=8)

        # chapéu
        hat = pygame.Rect(rx, self.rect.y - 10, self.rect.w, 14)
        pygame.draw.rect(surf, RED, hat, border_radius=4)
        brim = pygame.Rect(rx - 4, self.rect.y + 2, self.rect.w + 8, 8)
        pygame.draw.rect(surf, RED, brim, border_radius=3)

        # olho
        eye_x = rx + (self.rect.w - 8) if self.facing == 1 else rx + 6
        pygame.draw.circle(surf, BLACK, (eye_x, self.rect.y + 14), 4)
        pygame.draw.circle(surf, WHITE, (eye_x + self.facing, self.rect.y + 13), 2)

        # bigode
        mstache = [(rx + self.rect.w//2 - 10*self.facing, self.rect.y + 22),
                   (rx + self.rect.w//2 + 10*self.facing, self.rect.y + 22),
                   (rx + self.rect.w//2 + 14*self.facing, self.rect.y + 26),
                   (rx + self.rect.w//2 - 14*self.facing, self.rect.y + 26)]
        if len(set(mstache)) > 2:
            pygame.draw.polygon(surf, BROWN, mstache)

        # pernas animadas
        leg = int(abs(math.sin(self.t)) * 5) if abs(self.vx) > 0 else 0
        pygame.draw.rect(surf, DARK, pygame.Rect(rx + 4,           self.rect.bottom - 12 + leg, 12, 12), border_radius=3)
        pygame.draw.rect(surf, DARK, pygame.Rect(rx + self.rect.w - 16, self.rect.bottom - 12 - leg, 12, 12), border_radius=3)

# ─── HUD ─────────────────────────────────────────────────────────────────────

def draw_hud(surf, player):
    panel = pygame.Surface((220, 60), pygame.SRCALPHA)
    panel.fill((0, 0, 0, 120))
    surf.blit(panel, (8, 8))
    draw_rect_outline(surf, YELLOW, pygame.Rect(8, 8, 220, 60), 6, 2)
    coin_txt  = font_med.render(f"🪙 {player.coins:03d}", True, COINC)
    lives_txt = font_med.render(f"❤️ {player.lives}", True, RED)
    surf.blit(coin_txt,  (18, 14))
    surf.blit(lives_txt, (130, 14))
    tip = font_small.render("← → Mover  ↑/Espaço Pular", True, (220,220,220))
    surf.blit(tip, (18, 42))

# ─── Construção do Nível ──────────────────────────────────────────────────────

def build_level():
    FLOOR_Y = HEIGHT - TILE
    platforms = []
    q_blocks  = []
    coins     = []
    enemies   = []

    # chão principal (com buracos)
    segments = [(0, 14), (16, 28), (30, 50)]
    for seg in segments:
        for i in range(seg[0], seg[1]):
            platforms.append(Platform(i*TILE, FLOOR_Y, TILE, TILE*2, "ground"))

    # plataformas elevadas
    elevated = [
        (6,  HEIGHT-180, 3),
        (10, HEIGHT-230, 4),
        (18, HEIGHT-180, 3),
        (22, HEIGHT-260, 5),
        (33, HEIGHT-200, 4),
        (38, HEIGHT-150, 3),
        (43, HEIGHT-220, 4),
    ]
    for (gx, gy, gw) in elevated:
        for i in range(gw):
            platforms.append(Platform(gx*TILE + i*TILE, gy, TILE, TILE//2, "brick"))

    # blocos ?
    qdata = [
        (7,  HEIGHT-240, "coin"),
        (11, HEIGHT-290, "coin"),
        (12, HEIGHT-290, "coin"),
        (19, HEIGHT-240, "coin"),
        (23, HEIGHT-320, "coin"),
        (34, HEIGHT-260, "coin"),
        (44, HEIGHT-280, "coin"),
    ]
    for (qx, qy, qi) in qdata:
        q_blocks.append(QuestionBlock(qx*TILE, qy, qi))

    # moedas flutuantes
    coin_spots = [
        (8, HEIGHT-200), (9, HEIGHT-200),
        (20, HEIGHT-200), (21, HEIGHT-200),
        (25, HEIGHT-220), (26, HEIGHT-220), (27, HEIGHT-220),
        (35, HEIGHT-240), (36, HEIGHT-240),
        (40, HEIGHT-180), (41, HEIGHT-180),
    ]
    for (cx, cy) in coin_spots:
        coins.append(Coin(cx*TILE, cy))

    # canos
    pipes = [(15, 2), (29, 3), (32, 2), (47, 3)]
    for (px, ph) in pipes:
        platforms.append(Platform(px*TILE, FLOOR_Y - ph*TILE, TILE, ph*TILE, "pipe"))

    # inimigos
    enemy_data = [
        (8,  FLOOR_Y - 36,  7*TILE,  10*TILE),
        (13, FLOOR_Y - 36, 12*TILE,  15*TILE),
        (20, FLOOR_Y - 36, 18*TILE,  22*TILE),
        (23, HEIGHT-320-36,22*TILE,  27*TILE),
        (35, FLOOR_Y - 36, 33*TILE,  37*TILE),
        (40, FLOOR_Y - 36, 38*TILE,  43*TILE),
        (45, FLOOR_Y - 36, 44*TILE,  49*TILE),
    ]
    for (ex, ey, pl, pr) in enemy_data:
        enemies.append(Enemy(ex*TILE, ey, pl, pr))

    # bandeira
    flag = Flag(49*TILE, FLOOR_Y)

    return platforms, q_blocks, coins, enemies, flag

# ─── Loop principal ───────────────────────────────────────────────────────────

def main():
    global particles

    state = "menu"  # menu / game / dead / win

    def reset():
        nonlocal player, platforms, q_blocks, coins, enemies, flag
        global particles
        platforms, q_blocks, coins, enemies, flag = build_level()
        player  = Player(100, HEIGHT - TILE - 48 - 10)
        particles = []

    platforms, q_blocks, coins, enemies, flag = build_level()
    player = Player(100, HEIGHT - TILE - 48 - 10)

    cam_x    = 0
    WORLD_W  = 50 * TILE

    stars = [(random.randint(0, WIDTH), random.randint(0, HEIGHT//2), random.random()) for _ in range(80)]
    cloud_t = 0

    while True:
        dt = clock.tick(FPS)
        keys = pygame.key.get_pressed()

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit(); sys.exit()
            if event.type == pygame.KEYDOWN:
                if state == "menu" and event.key in (pygame.K_RETURN, pygame.K_SPACE):
                    state = "game"
                    reset()
                elif state in ("dead","win") and event.key in (pygame.K_RETURN, pygame.K_SPACE):
                    state = "game"
                    reset()
                elif event.key == pygame.K_ESCAPE:
                    pygame.quit(); sys.exit()

        # ── Menu ──────────────────────────────────────────────────────────────
        if state == "menu":
            screen.fill(SKY)
            # gradiente céu
            for y in range(HEIGHT):
                t = y / HEIGHT
                c = lerp_color(DARKSKY, SKY, t)
                pygame.draw.line(screen, c, (0, y), (WIDTH, y))

            title = font_big.render("SUPER PYMARIO", True, YELLOW)
            shadow = font_big.render("SUPER PYMARIO", True, BROWN)
            screen.blit(shadow, (WIDTH//2 - title.get_width()//2 + 3, 140 + 3))
            screen.blit(title,  (WIDTH//2 - title.get_width()//2,     140))

            sub = font_med.render("Pressione ENTER ou ESPAÇO para jogar", True, WHITE)
            screen.blit(sub, (WIDTH//2 - sub.get_width()//2, 230))

            ctrl = [
                "← → ou A D : Mover",
                "↑ ou W ou Espaço : Pular",
                "Pule sobre inimigos para eliminá-los!",
                "Bata nos blocos ? para ganhar moedas!",
            ]
            for i, c in enumerate(ctrl):
                t = font_small.render(c, True, (220,240,255))
                screen.blit(t, (WIDTH//2 - t.get_width()//2, 310 + i*28))

            # personagem decorativo
            pygame.draw.rect(screen, RED,  (WIDTH//2 - 20, 450, 40, 14), border_radius=4)
            pygame.draw.rect(screen, RED,  (WIDTH//2 - 24, 462, 48, 8),  border_radius=3)
            pygame.draw.rect(screen, (255,200,140), (WIDTH//2 - 16, 464, 32, 28), border_radius=8)
            pygame.draw.rect(screen, BLUE, (WIDTH//2 - 14, 490, 28, 22), border_radius=4)
            pygame.draw.circle(screen, BLACK, (WIDTH//2 + 10, 470), 4)

            pygame.display.flip()
            continue

        # ── Jogo ──────────────────────────────────────────────────────────────
        if state == "game":
            player.handle_input(keys)
            player.update(platforms, q_blocks, coins, enemies, flag)

            for qb in q_blocks: qb.update()
            for e in enemies:   e.update(platforms)
            for c in coins:     c.update()
            for p in particles[:]:
                p.update()
                if p.life <= 0: particles.remove(p)

            # câmera suave
            target_cam = player.rect.centerx - WIDTH // 3
            target_cam = max(0, min(target_cam, WORLD_W - WIDTH))
            cam_x += (target_cam - cam_x) * 0.1

            cloud_t += 0.3

            if not player.alive: state = "dead"
            if player.win:       state = "win"

        # ─── Renderização ─────────────────────────────────────────────────────
        # céu gradiente
        for y in range(HEIGHT):
            t = y / HEIGHT
            c = lerp_color(DARKSKY, SKY, t)
            pygame.draw.line(screen, c, (0, y), (WIDTH, y))

        # estrelas (só no topo)
        for (sx, sy, sb) in stars:
            br = int(80 + sb * 80)
            if sy < HEIGHT // 3:
                pygame.draw.circle(screen, (br, br, br), (sx, sy), 1)

        # nuvens decorativas
        for i in range(5):
            cx = int((i * 220 - cloud_t * (0.5 + i*0.1)) % (WIDTH + 200)) - 100
            cy = 60 + i * 20 % 80
            pygame.draw.ellipse(screen, WHITE, (cx, cy, 90, 36))
            pygame.draw.ellipse(screen, WHITE, (cx+20, cy-16, 60, 30))
            pygame.draw.ellipse(screen, WHITE, (cx+50, cy-4, 50, 30))

        # mundo
        for p in platforms:  p.draw(screen, int(cam_x))
        for qb in q_blocks:  qb.draw(screen, int(cam_x))
        for c in coins:      c.draw(screen, int(cam_x))
        for e in enemies:    e.draw(screen, int(cam_x))
        flag.draw(screen, int(cam_x))
        for p in particles:  p.draw(screen, int(cam_x))
        player.draw(screen, int(cam_x))

        draw_hud(screen, player)

        # ── Morreu ────────────────────────────────────────────────────────────
        if state == "dead":
            overlay = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
            overlay.fill((180, 0, 0, 160))
            screen.blit(overlay, (0, 0))
            txt = font_big.render("VOCÊ MORREU!", True, WHITE)
            screen.blit(txt, (WIDTH//2 - txt.get_width()//2, HEIGHT//2 - 60))
            sub = font_med.render("ENTER para tentar de novo", True, YELLOW)
            screen.blit(sub, (WIDTH//2 - sub.get_width()//2, HEIGHT//2 + 10))

        # ── Vitória ───────────────────────────────────────────────────────────
        if state == "win":
            overlay = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
            overlay.fill((0, 150, 0, 160))
            screen.blit(overlay, (0, 0))
            txt = font_big.render("🏆 VOCÊ VENCEU! 🏆", True, YELLOW)
            screen.blit(txt, (WIDTH//2 - txt.get_width()//2, HEIGHT//2 - 70))
            score_txt = font_med.render(f"Moedas coletadas: {player.coins}", True, WHITE)
            screen.blit(score_txt, (WIDTH//2 - score_txt.get_width()//2, HEIGHT//2))
            sub = font_med.render("ENTER para jogar novamente", True, COINC)
            screen.blit(sub, (WIDTH//2 - sub.get_width()//2, HEIGHT//2 + 50))

        pygame.display.flip()

if __name__ == "__main__":
    main()